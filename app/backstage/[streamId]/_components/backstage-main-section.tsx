import React from "react";
import { BackstageStreamScreen } from "./backstage-stream-screen";
import { BackstageLayoutSelector } from "./backstage-layout-selector";
import { BackstageFooterAction } from "./backstage-footer-action";
import { LayoutControlPanel } from "./layout-control-panel";
import { LayoutTestPanel } from "./layout-test-panel";

interface BackstageMainSectionProps {
  streamId: string;
  currentUserId: string;
  userRole: string;
}

export const BackstageMainSection = ({
  streamId,
  currentUserId,
  userRole,
}: BackstageMainSectionProps) => {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="w-full h-full p-4 flex gap-4">
        {/* Left side - Stream preview and layout selector */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <BackstageStreamScreen />
          <BackstageLayoutSelector />
        </div>

        {/* Right side - Control panels */}
        <div className="w-80 flex-shrink-0 space-y-4">
          <LayoutControlPanel streamId={streamId} />
          {/* <LayoutTestPanel /> */}
        </div>
      </div>

      <div className="w-full h-[80px] bg-lightDarkCard border-t border-t-border/40">
        <BackstageFooterAction streamId={streamId} />
      </div>
    </div>
  );
};
