import React from "react";
import { CustomTagState } from "./stateTypes";
import { Database } from "lucide-react";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableStateIndicator,
} from "./OpenLovableCardPrimitives";

interface OpenLovableDatabaseSchemaProps {
  node: {
    properties: {
      state?: CustomTagState;
    };
  };
  children: React.ReactNode;
}

export function OpenLovableDatabaseSchema({
  node,
  children,
}: OpenLovableDatabaseSchemaProps) {
  const { state } = node.properties;
  const isLoading = state === "pending";
  const content = typeof children === "string" ? children : "";

  return (
    <OpenLovableCard state={state} accentColor="teal">
      <OpenLovableCardHeader icon={<Database size={15} />} accentColor="teal">
        <OpenLovableBadge color="teal">Database Schema</OpenLovableBadge>
        {isLoading && <OpenLovableStateIndicator state="pending" />}
      </OpenLovableCardHeader>
      {content && (
        <div className="px-3 pb-3">
          <div className="p-3 text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto bg-muted/20 rounded-lg">
            {content}
          </div>
        </div>
      )}
    </OpenLovableCard>
  );
}
