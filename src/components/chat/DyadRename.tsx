import type React from "react";
import type { ReactNode } from "react";
import { FileEdit } from "lucide-react";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  Open-LovableFilePath,
  Open-LovableDescription,
} from "./Open-LovableCardPrimitives";
import { CustomTagState } from "./stateTypes";

interface Open-LovableRenameProps {
  children?: ReactNode;
  node?: any;
  from?: string;
  to?: string;
}

export const Open-LovableRename: React.FC<Open-LovableRenameProps> = ({
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
    <Open-LovableCard accentColor="amber" state={state}>
      <Open-LovableCardHeader icon={<FileEdit size={15} />} accentColor="amber">
        {displayTitle && (
          <span className="font-medium text-sm text-foreground truncate">
            {displayTitle}
          </span>
        )}
        <Open-LovableBadge color="amber">Rename</Open-LovableBadge>
      </Open-LovableCardHeader>
      {from && <Open-LovableFilePath path={`From: ${from}`} />}
      {to && <Open-LovableFilePath path={`To: ${to}`} />}
      {children && <Open-LovableDescription>{children}</Open-LovableDescription>}
    </Open-LovableCard>
  );
};
