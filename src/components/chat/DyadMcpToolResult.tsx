import React, { useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import { CodeHighlight } from "./CodeHighlight";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  OpenLovableExpandIcon,
  Open-LovableCardContent,
} from "./Open-LovableCardPrimitives";

interface Open-LovableMcpToolResultProps {
  node?: any;
  children?: React.ReactNode;
}

export const Open-LovableMcpToolResult: React.FC<Open-LovableMcpToolResultProps> = ({
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
    <Open-LovableCard
      accentColor="emerald"
      isExpanded={expanded}
      onClick={() => setExpanded((v) => !v)}
    >
      <Open-LovableCardHeader icon={<CheckCircle size={15} />} accentColor="emerald">
        <Open-LovableBadge color="emerald">Tool Result</Open-LovableBadge>
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
      </Open-LovableCardHeader>
      <Open-LovableCardContent isExpanded={expanded}>
        <CodeHighlight className="language-json">{prettyJson}</CodeHighlight>
      </Open-LovableCardContent>
    </Open-LovableCard>
  );
};
