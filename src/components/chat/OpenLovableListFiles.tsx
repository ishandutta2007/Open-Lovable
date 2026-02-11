import React, { useState } from "react";
import { CustomTagState } from "./stateTypes";
import { FolderOpen } from "lucide-react";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableExpandIcon,
  OpenLovableStateIndicator,
  OpenLovableCardContent,
} from "./OpenLovableCardPrimitives";

interface OpenLovableListFilesProps {
  node: {
    properties: {
      directory?: string;
      recursive?: string;
      include_hidden?: string;
      state?: CustomTagState;
    };
  };
  children: React.ReactNode;
}

export function OpenLovableListFiles({ node, children }: OpenLovableListFilesProps) {
  const { directory, recursive, include_hidden, state } = node.properties;
  const isLoading = state === "pending";
  const isRecursive = recursive === "true";
  const isIncludeHidden = include_hidden === "true";
  const content = typeof children === "string" ? children : "";
  const [isExpanded, setIsExpanded] = useState(false);

  const title = directory ? directory : "List Files";

  return (
    <OpenLovableCard
      state={state}
      accentColor="slate"
      isExpanded={isExpanded}
      onClick={() => setIsExpanded(!isExpanded)}
      data-testid="openlovable-list-files"
    >
      <OpenLovableCardHeader icon={<FolderOpen size={15} />} accentColor="slate">
        <span className="font-medium text-sm text-foreground truncate">
          {title}
        </span>
        {isRecursive && <OpenLovableBadge color="slate">recursive</OpenLovableBadge>}
        {isIncludeHidden && <OpenLovableBadge color="slate">include hidden</OpenLovableBadge>}
        {isLoading && (
          <OpenLovableStateIndicator state="pending" pendingLabel="Listing..." />
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={isExpanded} />
        </div>
      </OpenLovableCardHeader>
      <OpenLovableCardContent isExpanded={isExpanded}>
        {content && (
          <div className="p-3 text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto bg-muted/20 rounded-lg">
            {content}
          </div>
        )}
      </OpenLovableCardContent>
    </OpenLovableCard>
  );
}
