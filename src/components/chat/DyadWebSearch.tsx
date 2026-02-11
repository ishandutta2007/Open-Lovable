import type React from "react";
import { useState, type ReactNode } from "react";
import { Globe } from "lucide-react";
import { CustomTagState } from "./stateTypes";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  Open-LovableExpandIcon,
  Open-LovableStateIndicator,
  Open-LovableCardContent,
} from "./Open-LovableCardPrimitives";

interface Open-LovableWebSearchProps {
  children?: ReactNode;
  node?: any;
}

export const Open-LovableWebSearch: React.FC<Open-LovableWebSearchProps> = ({
  children,
  node,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const query =
    node?.properties?.query || (typeof children === "string" ? children : "");
  const state = node?.properties?.state as CustomTagState;
  const inProgress = state === "pending";

  return (
    <Open-LovableCard
      state={state}
      accentColor="blue"
      isExpanded={isExpanded}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <Open-LovableCardHeader icon={<Globe size={15} />} accentColor="blue">
        <Open-LovableBadge color="blue">Web Search</Open-LovableBadge>
        {!isExpanded && query && (
          <span className="text-sm text-muted-foreground italic truncate">
            {query}
          </span>
        )}
        {inProgress && (
          <Open-LovableStateIndicator state="pending" pendingLabel="Searching..." />
        )}
        <div className="ml-auto">
          <Open-LovableExpandIcon isExpanded={isExpanded} />
        </div>
      </Open-LovableCardHeader>
      <Open-LovableCardContent isExpanded={isExpanded}>
        <div className="text-sm text-muted-foreground space-y-2">
          {query && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Query:
              </span>
              <div className="italic mt-0.5 text-foreground">{query}</div>
            </div>
          )}
          {children && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Results:
              </span>
              <div className="mt-0.5 text-foreground">{children}</div>
            </div>
          )}
        </div>
      </Open-LovableCardContent>
    </Open-LovableCard>
  );
};
