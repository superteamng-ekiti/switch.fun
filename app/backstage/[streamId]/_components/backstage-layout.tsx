"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveKitRoom } from "@livekit/components-react";
import {
  Settings,
  Play,
  Mic,
  Video,
  Monitor,
  Clock,
  UserPlus,
} from "lucide-react";
import { RealTimeParticipants } from "./real-time-participants";
import { BackstageHeader } from "./backstage-header";
import { BackstageActionsSection } from "./backstage-actions-section";
import { BackstageMainSection } from "./backstage-main-section";

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

export const BackstageLayout = ({
  stream,
  currentUser,
  userRole,
  token,
  serverUrl,
}: BackstageLayoutProps) => {
  const [isGoingLive, setIsGoingLive] = useState(false);

  const handleGoLive = async () => {
    setIsGoingLive(true);
    // TODO: Implement go live functionality
    console.log("Going live...");
  };

  const coHosts = stream.participants.filter((p) => p.role === "CO_HOST");
  const isHost = userRole === "HOST";

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <BackstageHeader />

      <div className="w-full h-[calc(100vh-4rem)] flex gap-0">
        <BackstageMainSection />

        <BackstageActionsSection />
      </div>
    </LiveKitRoom>
  );
};
