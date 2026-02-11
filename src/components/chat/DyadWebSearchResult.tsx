import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { VanillaMarkdownParser } from "./Open-LovableMarkdownParser";
import { CustomTagState } from "./stateTypes";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  OpenLovableExpandIcon,
  Open-LovableStateIndicator,
  Open-LovableCardContent,
} from "./Open-LovableCardPrimitives";

interface Open-LovableWebSearchResultProps {
  node?: any;
  children?: React.ReactNode;
}

export const Open-LovableWebSearchResult: React.FC<Open-LovableWebSearchResultProps> = ({
  children,
  node,
}) => {
  const state = node?.properties?.state as CustomTagState;
  const inProgress = state === "pending";
  const [isExpanded, setIsExpanded] = useState(inProgress);

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
      <Open-LovableCardHeader icon={<Globe size={15} />} accentColor="blue">
        <Open-LovableBadge color="blue">Web Search Result</Open-LovableBadge>
        {inProgress && (
          <Open-LovableStateIndicator state="pending" pendingLabel="Loading..." />
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={isExpanded} />
        </div>
      </Open-LovableCardHeader>
      <Open-LovableCardContent isExpanded={isExpanded}>
        <div className="text-sm text-muted-foreground">
          {typeof children === "string" ? (
            <VanillaMarkdownParser content={children} />
          ) : (
            children
          )}
        </div>
      </Open-LovableCardContent>
    </Open-LovableCard>
  );
};
