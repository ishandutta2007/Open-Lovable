import React, { useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import { CodeHighlight } from "./CodeHighlight";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableExpandIcon,
  OpenLovableCardContent,
} from "./OpenLovableCardPrimitives";

interface OpenLovableMcpToolResultProps {
  node?: any;
  children?: React.ReactNode;
}

export const OpenLovableMcpToolResult: React.FC<OpenLovableMcpToolResultProps> = ({
  node,
  children,
}) => {
  const serverName: string = node?.properties?.serverName || "";
  const toolName: string = node?.properties?.toolName || "";
  const [expanded, setExpanded] = useState(false);

  const raw = typeof children === "string" ? children : String(children ?? "");

  const prettyJson = useMemo(() => {
    if (!expanded) return "";
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      console.error("Error parsing JSON for openlovable-mcp-tool-result", e);
      return raw;
    }
  }, [expanded, raw]);

  return (
    <OpenLovableCard
      accentColor="emerald"
      isExpanded={expanded}
      onClick={() => setExpanded((v) => !v)}
    >
      <OpenLovableCardHeader icon={<CheckCircle size={15} />} accentColor="emerald">
        <OpenLovableBadge color="emerald">Tool Result</OpenLovableBadge>
        {serverName && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800">
            {serverName}
          </span>
        )}
        {toolName && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground ring-1 ring-inset ring-border">
            {toolName}
          </span>
        )}
        <div className="ml-auto">
          <OpenLovableExpandIcon isExpanded={expanded} />
        </div>
      </OpenLovableCardHeader>
      <OpenLovableCardContent isExpanded={expanded}>
        <CodeHighlight className="language-json">{prettyJson}</CodeHighlight>
      </OpenLovableCardContent>
    </OpenLovableCard>
  );
};
