import type React from "react";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
  OpenLovableCard,
  OpenLovableCardHeader,
  OpenLovableBadge,
  OpenLovableFilePath,
  OpenLovableDescription,
} from "./OpenLovableCardPrimitives";
import { CustomTagState } from "./stateTypes";

interface OpenLovableDeleteProps {
  children?: ReactNode;
  node?: any;
  path?: string;
}

export const OpenLovableDelete: React.FC<OpenLovableDeleteProps> = ({
  children,
  node,
  path: pathProp,
}) => {
  const path = pathProp || node?.properties?.path || "";
  const state = node?.properties?.state as CustomTagState;
  const fileName = path ? path.split("/").pop() : "";

  return (
    <OpenLovableCard accentColor="red" state={state}>
      <OpenLovableCardHeader icon={<Trash2 size={15} />} accentColor="red">
        {fileName && (
          <span className="font-medium text-sm text-foreground truncate">
            {fileName}
          </span>
        )}
        <OpenLovableBadge color="red">Delete</OpenLovableBadge>
      </OpenLovableCardHeader>
      <OpenLovableFilePath path={path} />
      {children && <OpenLovableDescription>{children}</OpenLovableDescription>}
    </OpenLovableCard>
  );
};
