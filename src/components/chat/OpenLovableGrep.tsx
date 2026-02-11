import type React from "react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Search } from "lucide-react";
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

interface OpenLovableGrepProps {
  children?: ReactNode;
  node?: {
    properties?: {
      state?: CustomTagState;
      query?: string;
      include?: string;
      exclude?: string;
      "case-sensitive"?: string;
      count?: string;
      total?: string;
      truncated?: string;
    };
  };
}

export const OpenLovableGrep: React.FC<OpenLovableGrepProps> = ({ children, node }) => {
  const [isContentVisible, setIsContentVisible] = useState(false);

  const state = node?.properties?.state as CustomTagState;
  const inProgress = state === "pending";
  const aborted = state === "aborted";

  const query = node?.properties?.query || "";
  const includePattern = node?.properties?.include || "";
  const excludePattern = node?.properties?.exclude || "";
  const caseSensitive = node?.properties?.["case-sensitive"] === "true";
  const count = node?.properties?.count || "";
  const total = node?.properties?.total || "";
  const truncated = node?.properties?.truncated === "true";

  let description = `"${query}"`;
  if (includePattern) {
    description += ` in ${includePattern}`;
  }
  if (excludePattern) {
    description += ` excluding ${excludePattern}`;
  }
  if (caseSensitive) {
    description += " (case-sensitive)";
  }

  const resultSummary = count
    ? truncated && total
      ? `${count} of ${total} matches`
      : `${count} match${count === "1" ? "" : "es"}`
    : "";

  return (
    <OpenLovableCard
      state={state}
      accentColor="violet"
      onClick={() => setIsContentVisible(!isContentVisible)}
      isExpanded={isContentVisible}
      data-testid="openlovable-grep"
    >
      <OpenLovableCardHeader icon={<Search size={15} />} accentColor="violet">
        <OpenLovableBadge color="violet">GREP</OpenLovableBadge>
        <span className="font-medium text-sm text-foreground truncate">
          {description}
        </span>
        {resultSummary && (
          <span className="text-xs text-muted-foreground shrink-0">
            ({resultSummary})
          </span>
        )}
        {inProgress && (
          <OpenLovableStateIndicator state="pending" pendingLabel="Searching..." />
        )}
        {aborted && (
          <OpenLovableStateIndicator state="aborted" abortedLabel="Did not finish" />
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={isContentVisible} />
        </div>
      </OpenLovableCardHeader>
      <OpenLovableCardContent isExpanded={isContentVisible}>
        <div className="text-xs" onClick={(e) => e.stopPropagation()}>
          <CodeHighlight className="language-log">{children}</CodeHighlight>
        </div>
      </OpenLovableCardContent>
    </OpenLovableCard>
  );
};
