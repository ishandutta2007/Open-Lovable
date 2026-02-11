import type React from "react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Database } from "lucide-react";
import { CodeHighlight } from "./CodeHighlight";
import { CustomTagState } from "./stateTypes";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableExpandIcon,
  OpenLovableStateIndicator,
  OpenLovableCardContent,
} from "./OpenLovableCardPrimitives";

interface OpenLovableExecuteSqlProps {
  children?: ReactNode;
  node?: any;
  description?: string;
}

export const OpenLovableExecuteSql: React.FC<OpenLovableExecuteSqlProps> = ({
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
    <OpenLovableCard
      state={state}
      accentColor="teal"
      isExpanded={isContentVisible}
      onClick={() => setIsContentVisible(!isContentVisible)}
    >
      <OpenLovableCardHeader icon={<Database size={15} />} accentColor="teal">
        <OpenLovableBadge color="teal">SQL</OpenLovableBadge>
        {queryDescription && (
          <span className="font-medium text-sm text-foreground truncate">
            {queryDescription}
          </span>
        )}
        {inProgress && (
          <OpenLovableStateIndicator state="pending" pendingLabel="Executing..." />
        )}
        {aborted && (
          <OpenLovableStateIndicator state="aborted" abortedLabel="Did not finish" />
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={isContentVisible} />
        </div>
      </OpenLovableCardHeader>
      <OpenLovableCardContent isExpanded={isContentVisible}>
        <div className="text-xs">
          <CodeHighlight className="language-sql">{children}</CodeHighlight>
        </div>
      </OpenLovableCardContent>
    </OpenLovableCard>
  );
};
