import type React from "react";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
  Open-LovableCard,
  Open-LovableCardHeader,
  Open-LovableBadge,
  Open-LovableFilePath,
  Open-LovableDescription,
} from "./Open-LovableCardPrimitives";
import { CustomTagState } from "./stateTypes";

interface Open-LovableDeleteProps {
  children?: ReactNode;
  node?: any;
  path?: string;
}

export const Open-LovableDelete: React.FC<Open-LovableDeleteProps> = ({
  children,
  node,
  path: pathProp,
}) => {
  const path = pathProp || node?.properties?.path || "";
  const state = node?.properties?.state as CustomTagState;
  const fileName = path ? path.split("/").pop() : "";

  return (
    <Open-LovableCard accentColor="red" state={state}>
      <Open-LovableCardHeader icon={<Trash2 size={15} />} accentColor="red">
        {fileName && (
          <span className="font-medium text-sm text-foreground truncate">
            {fileName}
          </span>
        )}
        <Open-LovableBadge color="red">Delete</Open-LovableBadge>
      </Open-LovableCardHeader>
      <Open-LovableFilePath path={path} />
      {children && <Open-LovableDescription>{children}</Open-LovableDescription>}
    </Open-LovableCard>
  );
};
