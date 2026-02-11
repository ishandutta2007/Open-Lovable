import type React from "react";
import type { ReactNode } from "react";
import { ScanQrCode } from "lucide-react";
import { Open-LovableCard, Open-LovableCardHeader, Open-LovableBadge } from "./Open-LovableCardPrimitives";

interface Open-LovableWebCrawlProps {
  children?: ReactNode;
  node?: any;
}

export const Open-LovableWebCrawl: React.FC<Open-LovableWebCrawlProps> = ({
  children,
  node: _node,
}) => {
  return (
    <Open-LovableCard accentColor="blue">
      <Open-LovableCardHeader icon={<ScanQrCode size={15} />} accentColor="blue">
        <Open-LovableBadge color="blue">Web Crawl</Open-LovableBadge>
      </Open-LovableCardHeader>
      {children && (
        <div className="px-3 pb-2 text-sm italic text-muted-foreground">
          {children}
        </div>
      )}
    </Open-LovableCard>
  );
};
