import React from "react";
import { CustomTagState } from "./stateTypes";
import { Database } from "lucide-react";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  Open-LovableStateIndicator,
} from "./Open-LovableCardPrimitives";

interface Open-LovableDatabaseSchemaProps {
  node: {
    properties: {
      state?: CustomTagState;
    };
  };
  children: React.ReactNode;
}

export function Open-LovableDatabaseSchema({
  node,
  children,
}: Open-LovableDatabaseSchemaProps) {
  const { state } = node.properties;
  const isLoading = state === "pending";
  const content = typeof children === "string" ? children : "";

  return (
    <Open-LovableCard state={state} accentColor="teal">
      <Open-LovableCardHeader icon={<Database size={15} />} accentColor="teal">
        <Open-LovableBadge color="teal">Database Schema</Open-LovableBadge>
        {isLoading && <Open-LovableStateIndicator state="pending" />}
      </Open-LovableCardHeader>
      {content && (
        <div className="px-3 pb-3">
          <div className="p-3 text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto bg-muted/20 rounded-lg">
            {content}
          </div>
        </div>
      )}
    </Open-LovableCard>
  );
}
