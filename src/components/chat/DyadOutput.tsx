import React, { useState } from "react";
import { AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { useAtomValue } from "jotai";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";
import { useStreamChat } from "@/hooks/useStreamChat";
import { CopyErrorMessage } from "@/components/CopyErrorMessage";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  OpenLovableExpandIcon,
  Open-LovableCardContent,
} from "./Open-LovableCardPrimitives";

interface Open-LovableOutputProps {
  type: "error" | "warning";
  message?: string;
  children?: React.ReactNode;
}

export const Open-LovableOutput: React.FC<Open-LovableOutputProps> = ({
  type,
  message,
  children,
}) => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const selectedChatId = useAtomValue(selectedChatIdAtom);
  const { streamMessage } = useStreamChat();

  // If the type is not warning, it is an error (in case LLM gives a weird "type")
  const isError = type !== "warning";
  const accentColor = isError ? "red" : "amber";
  const icon = isError ? <XCircle size={15} /> : <AlertTriangle size={15} />;
  const label = isError ? "Error" : "Warning";

  const handleAIFix = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message && selectedChatId) {
      streamMessage({
        prompt: `Fix the error: ${message}`,
        chatId: selectedChatId,
      });
    }
  };

  return (
    <Open-LovableCard
      showAccent
      accentColor={accentColor}
      onClick={() => setIsContentVisible(!isContentVisible)}
      isExpanded={isContentVisible}
    >
      <Open-LovableCardHeader icon={icon} accentColor={accentColor}>
        <Open-LovableBadge color={accentColor}>{label}</Open-LovableBadge>
        {message && (
          <span className="text-sm text-foreground truncate">
            {message.slice(0, isContentVisible ? undefined : 100) +
              (!isContentVisible && message.length > 100 ? "..." : "")}
          </span>
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={isContentVisible} />
        </div>
      </Open-LovableCardHeader>

      {/* Content area */}
      <Open-LovableCardContent isExpanded={isContentVisible}>
        {children && (
          <div className="text-sm text-muted-foreground mb-3">{children}</div>
        )}
      </Open-LovableCardContent>

      {/* Action buttons at the bottom - always visible for errors */}
      {isError && message && (
        <div className="px-3 pb-2 flex justify-end gap-2">
          <CopyErrorMessage
            errorMessage={children ? `${message}\n${children}` : message}
          />
          <button
            onClick={handleAIFix}
            className="cursor-pointer flex items-center justify-center bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-md text-xs px-2.5 py-1 h-6 transition-colors"
          >
            <Sparkles size={13} className="mr-1" />
            <span>Fix with AI</span>
          </button>
        </div>
      )}
    </Open-LovableCard>
  );
};
