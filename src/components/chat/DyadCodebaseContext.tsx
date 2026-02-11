import React, { useState, useEffect } from "react";
import { Code2, FileText } from "lucide-react";
import { CustomTagState } from "./stateTypes";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  Open-LovableExpandIcon,
  Open-LovableStateIndicator,
  Open-LovableCardContent,
} from "./Open-LovableCardPrimitives";

interface Open-LovableCodebaseContextProps {
  children: React.ReactNode;
  node?: {
    properties?: {
      files?: string;
      state?: CustomTagState;
    };
  };
}

export const Open-LovableCodebaseContext: React.FC<Open-LovableCodebaseContextProps> = ({
  node,
}) => {
  const state = node?.properties?.state as CustomTagState;
  const inProgress = state === "pending";
  const [isExpanded, setIsExpanded] = useState(inProgress);
  const files = node?.properties?.files?.split(",") || [];

  useEffect(() => {
    if (!inProgress && isExpanded) {
      setIsExpanded(false);
    }
  }, [inProgress]);

  return (
    <Open-LovableCard
      state={state}
      accentColor="blue"
      onClick={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
    >
      <Open-LovableCardHeader icon={<Code2 size={15} />} accentColor="blue">
        <Open-LovableBadge color="blue">Codebase Context</Open-LovableBadge>
        {files.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Using {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        )}
        {inProgress && <Open-LovableStateIndicator state="pending" />}
        <div className="ml-auto">
          <Open-LovableExpandIcon isExpanded={isExpanded} />
        </div>
      </Open-LovableCardHeader>
      <Open-LovableCardContent isExpanded={isExpanded}>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((file, index) => {
              const filePath = file.trim();
              const fileName = filePath.split("/").pop() || filePath;
              const pathPart =
                filePath.substring(0, filePath.length - fileName.length) || "";

              return (
                <div key={index} className="px-2 py-1 bg-muted/40 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <FileText
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {fileName}
                    </span>
                  </div>
                  {pathPart && (
                    <div className="text-[11px] text-muted-foreground ml-5 font-mono">
                      {pathPart}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Open-LovableCardContent>
    </Open-LovableCard>
  );
};
