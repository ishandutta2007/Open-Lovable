import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { VanillaMarkdownParser } from "./OpenLovableMarkdownParser";
import { CustomTagState } from "./stateTypes";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableExpandIcon,
  OpenLovableStateIndicator,
  OpenLovableCardContent,
} from "./OpenLovableCardPrimitives";

interface OpenLovableWebSearchResultProps {
  node?: any;
  children?: React.ReactNode;
}

export const OpenLovableWebSearchResult: React.FC<OpenLovableWebSearchResultProps> = ({
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
    <OpenLovableCard
      state={state}
      accentColor="blue"
      onClick={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
    >
      <OpenLovableCardHeader icon={<Globe size={15} />} accentColor="blue">
        <OpenLovableBadge color="blue">Web Search Result</OpenLovableBadge>
        {inProgress && (
          <OpenLovableStateIndicator state="pending" pendingLabel="Loading..." />
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={isExpanded} />
        </div>
      </OpenLovableCardHeader>
      <OpenLovableCardContent isExpanded={isExpanded}>
        <div className="text-sm text-muted-foreground">
          {typeof children === "string" ? (
            <VanillaMarkdownParser content={children} />
          ) : (
            children
          )}
        </div>
      </OpenLovableCardContent>
    </OpenLovableCard>
  );
};
