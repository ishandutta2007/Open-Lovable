import React, { useState } from "react";
import { CustomTagState } from "./stateTypes";
import { Database } from "lucide-react";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableExpandIcon,
  OpenLovableStateIndicator,
  OpenLovableCardContent,
} from "./OpenLovableCardPrimitives";

interface OpenLovableSupabaseProjectInfoProps {
  node: {
    properties: {
      state?: CustomTagState;
    };
  };
  children: React.ReactNode;
}

export function OpenLovableSupabaseProjectInfo({
  node,
  children,
}: OpenLovableSupabaseProjectInfoProps) {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const { state } = node.properties;
  const isLoading = state === "pending";
  const isAborted = state === "aborted";
  const content = typeof children === "string" ? children : "";

  return (
    <OpenLovableCard
      state={state}
      accentColor="teal"
      isExpanded={isContentVisible}
      onClick={() => setIsContentVisible(!isContentVisible)}
    >
      <OpenLovableCardHeader icon={<Database size={15} />} accentColor="teal">
        <OpenLovableBadge color="teal">Supabase Project Info</OpenLovableBadge>
        {isLoading && (
          <OpenLovableStateIndicator state="pending" pendingLabel="Fetching..." />
        )}
        {isAborted && (
          <OpenLovableStateIndicator state="aborted" abortedLabel="Did not finish" />
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={isContentVisible} />
        </div>
      </OpenLovableCardHeader>
      <OpenLovableCardContent isExpanded={isContentVisible}>
        {content && (
          <div className="p-3 text-xs font-mono whitespace-pre-wrap max-h-80 overflow-y-auto bg-muted/20 rounded-lg">
            {content}
          </div>
        )}
      </OpenLovableCardContent>
    </OpenLovableCard>
  );
}
