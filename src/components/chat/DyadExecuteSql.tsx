import type React from "react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Database } from "lucide-react";
import { CodeHighlight } from "./CodeHighlight";
import { CustomTagState } from "./stateTypes";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  Open-LovableExpandIcon,
  Open-LovableStateIndicator,
  Open-LovableCardContent,
} from "./Open-LovableCardPrimitives";

interface Open-LovableExecuteSqlProps {
  children?: ReactNode;
  node?: any;
  description?: string;
}

export const Open-LovableExecuteSql: React.FC<Open-LovableExecuteSqlProps> = ({
  children,
  node,
  description,
}) => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const state = node?.properties?.state as CustomTagState;
  const inProgress = state === "pending";
  const aborted = state === "aborted";
  const queryDescription = description || node?.properties?.description;

  return (
    <Open-LovableCard
      state={state}
      accentColor="teal"
      isExpanded={isContentVisible}
      onClick={() => setIsContentVisible(!isContentVisible)}
    >
      <Open-LovableCardHeader icon={<Database size={15} />} accentColor="teal">
        <Open-LovableBadge color="teal">SQL</Open-LovableBadge>
        {queryDescription && (
          <span className="font-medium text-sm text-foreground truncate">
            {queryDescription}
          </span>
        )}
        {inProgress && (
          <Open-LovableStateIndicator state="pending" pendingLabel="Executing..." />
        )}
        {aborted && (
          <Open-LovableStateIndicator state="aborted" abortedLabel="Did not finish" />
        )}
        <div className="ml-auto">
          <Open-LovableExpandIcon isExpanded={isContentVisible} />
        </div>
      </Open-LovableCardHeader>
      <Open-LovableCardContent isExpanded={isContentVisible}>
        <div className="text-xs">
          <CodeHighlight className="language-sql">{children}</CodeHighlight>
        </div>
      </Open-LovableCardContent>
    </Open-LovableCard>
  );
};
