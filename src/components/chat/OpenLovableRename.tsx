import type React from "react";
import type { ReactNode } from "react";
import { FileEdit } from "lucide-react";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableFilePath,
  OpenLovableDescription,
} from "./OpenLovableCardPrimitives";
import { CustomTagState } from "./stateTypes";

interface OpenLovableRenameProps {
  children?: ReactNode;
  node?: any;
  from?: string;
  to?: string;
}

export const OpenLovableRename: React.FC<OpenLovableRenameProps> = ({
  children,
  node,
  from: fromProp,
  to: toProp,
}) => {
  const from = fromProp || node?.properties?.from || "";
  const to = toProp || node?.properties?.to || "";
  const state = node?.properties?.state as CustomTagState;

  const fromFileName = from ? from.split("/").pop() : "";
  const toFileName = to ? to.split("/").pop() : "";

  const displayTitle =
    fromFileName && toFileName
      ? `${fromFileName} → ${toFileName}`
      : fromFileName || toFileName || "";

  return (
    <OpenLovableCard accentColor="amber" state={state}>
      <OpenLovableCardHeader icon={<FileEdit size={15} />} accentColor="amber">
        {displayTitle && (
          <span className="font-medium text-sm text-foreground truncate">
            {displayTitle}
          </span>
        )}
        <OpenLovableBadge color="amber">Rename</OpenLovableBadge>
      </OpenLovableCardHeader>
      {from && <OpenLovableFilePath path={`From: ${from}`} />}
      {to && <OpenLovableFilePath path={`To: ${to}`} />}
      {children && <OpenLovableDescription>{children}</OpenLovableDescription>}
    </OpenLovableCard>
  );
};
