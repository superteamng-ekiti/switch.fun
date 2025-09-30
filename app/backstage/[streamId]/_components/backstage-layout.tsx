"use client";

import React, { useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { BackstageHeader } from "./backstage-header";
import { BackstageActionsSection } from "./backstage-actions-section";
import { BackstageMainSection } from "./backstage-main-section";
import { useBackstageMedia } from "@/hooks/use-backstage-media";
import { useBackstageLiveKit } from "@/hooks/use-backstage-livekit";

interface Stream {
  id: string;
  title: string | null;
  name: string;
  liveKitRoomName: string | null;
  isPreLive: boolean;
  isLive: boolean;
  user: {
    id: string;
    username: string;
    imageUrl: string;
  };
  participants: Array<{
    id: string;
    role: string;
    status: string;
    user: {
      id: string;
      username: string;
      imageUrl: string;
    };
  }>;
}

interface BackstageLayoutProps {
  stream: Stream;
  currentUser: {
    id: string;
    username: string;
  };
  userRole: string;
  token: string;
  serverUrl: string;
}

function BackstageContent({
  stream,
  currentUser,
  userRole,
}: {
  stream: Stream;
  currentUser: { id: string; username: string };
  userRole: string;
}) {
  // Initialize backstage hooks
  useBackstageMedia();
  useBackstageLiveKit();

  return (
    <>
      {/* Header */}
      <BackstageHeader />

      <div className="w-full h-[calc(100vh-4rem)] flex gap-0">
        <BackstageMainSection />

        <BackstageActionsSection
          streamId={stream.id}
          currentUserId={currentUser.id}
          userRole={userRole}
        />
      </div>
    </>
  );
}

export function BackstageLayout({
  stream,
  currentUser,
  userRole,
  token,
  serverUrl,
}: BackstageLayoutProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      className="min-h-screen bg-background"
      connect={true}
    >
      <BackstageContent
        stream={stream}
        currentUser={currentUser}
        userRole={userRole}
      />
    </LiveKitRoom>
  );
}
