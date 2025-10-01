"use client";

import React, { memo } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { BackstageHeader } from "./backstage-header";
import { BackstageActionsSection } from "./backstage-actions-section";
import { BackstageMainSection } from "./backstage-main-section";
import { BackstageErrorBoundary } from "./backstage-error-boundary";
import { useBackstageMedia } from "@/hooks/use-backstage-media";
import { useBackstageLiveKit } from "@/hooks/use-backstage-livekit";

// Layout constants
const HEADER_HEIGHT = '4rem';

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
  participants?: Array<{
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

interface BackstageContentProps {
  stream: Stream;
  currentUser: { id: string; username: string };
  userRole: string;
}

const BackstageContent = memo(function BackstageContent({
  stream,
  currentUser,
  userRole,
}: BackstageContentProps) {
  // Initialize backstage hooks
  useBackstageMedia();
  useBackstageLiveKit();

  return (
    <>
      {/* Header */}
      <BackstageHeader />

      <div 
        className="w-full flex gap-0"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        <BackstageMainSection 
          streamId={stream.id}
          currentUserId={currentUser.id}
          userRole={userRole}
        />

        <BackstageActionsSection
          streamId={stream.id}
          currentUserId={currentUser.id}
          userRole={userRole}
        />
      </div>
    </>
  );
});

// Set display name for React DevTools
BackstageContent.displayName = 'BackstageContent';

export function BackstageLayout({
  stream,
  currentUser,
  userRole,
  token,
  serverUrl,
}: BackstageLayoutProps) {
  return (
    <BackstageErrorBoundary>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        className="min-h-screen bg-background"
        connect={true}
        onConnected={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[BackstageLayout] Connected to LiveKit');
          }
        }}
        onDisconnected={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[BackstageLayout] Disconnected from LiveKit');
          }
        }}
        onError={(error) => {
          console.error('[BackstageLayout] LiveKit error:', error);
        }}
      >
        <BackstageContent
          stream={stream}
          currentUser={currentUser}
          userRole={userRole}
        />
      </LiveKitRoom>
    </BackstageErrorBoundary>
  );
}
