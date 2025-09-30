"use client";

import { BackstageActionMenuItem } from "./backstage-action-menu-item";
import { BackstageChatPanel } from "./backstage-chat-panel";
import { BackstageMediaPanel } from "./backstage-media-panel";
import { BackstageParticipantsPanel } from "./backstage-participants-panel";
import { BackstageTipsPanel } from "./backstage-tips-panel";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import {
  selectedSidebarMenuAtom,
  toggleSidebarMenuAtom,
  isSidebarExpandedAtom,
  type SidebarMenuType,
} from "@/store/backstage-atoms";

const menuItems = [
  {
    icon: "/icon/chat.svg",
    label: "Chat",
    value: "chat" as SidebarMenuType,
  },
  {
    icon: "/icon/media.svg",
    label: "Media Asset",
    value: "media" as SidebarMenuType,
  },
  {
    icon: "/icon/participant.svg",
    label: "Participants",
    value: "participants" as SidebarMenuType,
  },
  {
    icon: "/icon/tip-jar.svg",
    label: "Tips",
    value: "tips" as SidebarMenuType,
  },
];

interface BackstageActionsSectionProps {
  streamId: string;
  currentUserId: string;
  userRole: string;
}

export function BackstageActionsSection({
  streamId,
  currentUserId,
  userRole,
}: BackstageActionsSectionProps) {
  const selectedMenuItem = useAtomValue(selectedSidebarMenuAtom);
  const isExpanded = useAtomValue(isSidebarExpandedAtom);
  const [, toggleMenu] = useAtom(toggleSidebarMenuAtom);

  return (
    <div
      className={cn(
        "h-full w-full max-w-[475px] bg-lightDarkCard flex gap-0 border-l border-border/40 transition-all duration-300 ease-in-out",
        !isExpanded && "max-w-[120px]"
      )}
    >
      {isExpanded && (
        <div className="w-full h-full overflow-hidden">
          {selectedMenuItem === "chat" && (
            <BackstageChatPanel streamId={streamId} />
          )}
          {selectedMenuItem === "media" && (
            <BackstageMediaPanel streamId={streamId} />
          )}
          {selectedMenuItem === "participants" && (
            <BackstageParticipantsPanel
              streamId={streamId}
              currentUserId={currentUserId}
              userRole={userRole}
            />
          )}
          {selectedMenuItem === "tips" && (
            <BackstageTipsPanel streamId={streamId} />
          )}
        </div>
      )}

      <div className="w-full h-full max-w-[120px] bg-transparent border-l border-border/40 px-2 py-10 flex flex-col gap-4">
        {menuItems.map((item) => (
          <BackstageActionMenuItem
            key={item.value}
            icon={item.icon}
            label={item.label}
            selected={selectedMenuItem === item.value}
            onClick={() => toggleMenu(item.value)}
          />
        ))}
      </div>
    </div>
  );
}
