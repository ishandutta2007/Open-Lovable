import type React from "react";
import type { ReactNode } from "react";
import { ScanQrCode } from "lucide-react";
import { OpenLovableCard, OpenLovableCardHeader, OpenLovableBadge } from "./OpenLovableCardPrimitives";

interface OpenLovableWebCrawlProps {
  children?: ReactNode;
  node?: any;
}

export const OpenLovableWebCrawl: React.FC<OpenLovableWebCrawlProps> = ({
  children,
  node: _node,
}) => {
  return (
    <OpenLovableCard accentColor="blue">
      <OpenLovableCardHeader icon={<ScanQrCode size={15} />} accentColor="blue">
        <OpenLovableBadge color="blue">Web Crawl</OpenLovableBadge>
      </OpenLovableCardHeader>
      {children && (
        <div className="px-3 pb-2 text-sm italic text-muted-foreground">
          {children}
        </div>
      )}
    </OpenLovableCard>
  );
};
