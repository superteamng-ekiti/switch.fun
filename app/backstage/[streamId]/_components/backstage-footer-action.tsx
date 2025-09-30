"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  toggleMicAtom,
  toggleCameraAtom,
  toggleScreenShareAtom,
  mediaStateAtom,
} from "@/store/backstage-atoms";
import { BackstageFooterItem } from "./backstage-footer-item";
import { BackstageFooterItemDropdown } from "./backstage-footer-item-dropdown";

export function BackstageFooterAction() {
  const mediaState = useAtomValue(mediaStateAtom);
  const [, toggleMic] = useAtom(toggleMicAtom);
  const [, toggleCamera] = useAtom(toggleCameraAtom);
  const [, toggleScreenShare] = useAtom(toggleScreenShareAtom);

  const handleLeaveRoom = () => {
    // TODO: Implement leave room logic
    console.log("Leave room");
  };

  const handleInviteUser = () => {
    // TODO: Implement invite user logic
    console.log("Invite user");
  };

  return (
    <div className="w-full h-full flex items-center justify-center gap-4">
      <BackstageFooterItemDropdown
        icon="/icon/mic.svg"
        alt="microphone"
        onToggle={toggleMic}
        isActive={mediaState.isMicEnabled}
        deviceType="microphone"
      />
      <BackstageFooterItemDropdown
        icon="/icon/video.svg"
        alt="camera"
        onToggle={toggleCamera}
        isActive={mediaState.isCameraEnabled}
        deviceType="camera"
      />
      <BackstageFooterItem
        icon="/icon/share-screen.svg"
        alt="share-screen"
        onClick={toggleScreenShare}
        isActive={mediaState.isScreenSharing}
      />
      <BackstageFooterItem
        icon="/icon/invite-user.svg"
        alt="invite-user"
        onClick={handleInviteUser}
      />
      <BackstageFooterItem
        icon="/icon/logout.svg"
        alt="logout-room"
        onClick={handleLeaveRoom}
        className="bg-red-700 hover:bg-red-800"
      />
    </div>
  );
}
