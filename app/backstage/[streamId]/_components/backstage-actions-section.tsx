import Image from "next/image";
import React from "react";
import { BackstageActionMenuItem } from "./backstage-action-menu-item";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    icon: "/icon/chat.svg",
    label: "Chat",
  },
  {
    icon: "/icon/media.svg",
    label: "Media Asset",
  },
  {
    icon: "/icon/participant.svg",
    label: "Participants",
  },
  {
    icon: "/icon/tip-jar.svg",
    label: "Tips",
  },
];

export const BackstageActionsSection = () => {
  const [selectedMenuItem, setSelectedMenuItem] = React.useState<
    "chat" | "media" | "participants" | "tips" | null
  >(null);
  return (
    <div
      className={cn(
        "h-full w-full max-w-[475px] bg-lightDarkCard flex gap-0 border-l border-border/40",
        selectedMenuItem === null &&
          "max-w-[120px] transition-all duration-300 ease-in-out"
      )}
    >
      {selectedMenuItem !== null ? (
        <div className="w-full h-full"></div>
      ) : null}

      <div className="w-full h-full max-w-[120px] bg-transparent border-l border-border/40 px-2 py-10 flex flex-col gap-4">
        {menuItems.map((item, index) => (
          <BackstageActionMenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            selected={
              selectedMenuItem ===
              (item.label.toLowerCase() as
                | "chat"
                | "media"
                | "participants"
                | "tips")
            }
            onClick={() =>
              setSelectedMenuItem(
                item.label.toLowerCase() as
                  | "chat"
                  | "media"
                  | "participants"
                  | "tips"
              )
            }
          />
        ))}
      </div>
    </div>
  );
};
