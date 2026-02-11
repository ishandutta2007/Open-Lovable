import React, { useState } from "react";
import { CustomTagState } from "./stateTypes";
import { Table2 } from "lucide-react";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableExpandIcon,
  OpenLovableStateIndicator,
  OpenLovableCardContent,
} from "./OpenLovableCardPrimitives";

interface OpenLovableSupabaseTableSchemaProps {
  node: {
    properties: {
      table?: string;
      state?: CustomTagState;
    };
  };
  children: React.ReactNode;
}

export function OpenLovableSupabaseTableSchema({
  node,
  children,
}: OpenLovableSupabaseTableSchemaProps) {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const { table, state } = node.properties;
  const isLoading = state === "pending";
  const isAborted = state === "aborted";
  const content = typeof children === "string" ? children : "";

  return (
    <OpenLovableCard
      state={state}
      accentColor="teal"
      onClick={() => setIsContentVisible(!isContentVisible)}
      isExpanded={isContentVisible}
    >
      <OpenLovableCardHeader icon={<Table2 size={15} />} accentColor="teal">
        <OpenLovableBadge color="teal">
          {table ? "Table Schema" : "Supabase Table Schema"}
        </OpenLovableBadge>
        {table && (
          <span className="font-medium text-sm text-foreground truncate">
            {table}
          </span>
        )}
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
