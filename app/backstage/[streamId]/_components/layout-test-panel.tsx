"use client";

import React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { selectedLayoutAtom, type LayoutType } from "@/store/backstage-atoms";
import { useParticipants } from "@livekit/components-react";
import { Camera, Monitor, Mic, MicOff, Video, VideoOff } from "lucide-react";

/**
 * Layout Test Panel Component
 * 
 * Provides quick testing controls for layout functionality
 * Shows participant status and layout switching
 */
export function LayoutTestPanel() {
  const selectedLayout = useAtomValue(selectedLayoutAtom);
  const setSelectedLayout = useSetAtom(selectedLayoutAtom);
  const participants = useParticipants();

  const layouts: Array<{ type: LayoutType; name: string; description: string }> = [
    { type: "single", name: "Single", description: "Solo streamer" },
    { type: "multi-full", name: "Multi Full", description: "Side-by-side" },
    { type: "multi-half", name: "Multi Half", description: "Centered pair" },
    { type: "grid", name: "Grid", description: "Equal grid" },
    { type: "single-screen", name: "Single + Screen", description: "Presenter mode" },
    { type: "multi-screen", name: "Multi + Screen", description: "Group presentation" },
    { type: "vs-screen", name: "VS Mode", description: "Competition layout" },
  ];

  const videoParticipants = participants.filter(p => p.isCameraEnabled);
  const audioParticipants = participants.filter(p => p.isMicrophoneEnabled);
  const screenShareActive = participants.some(p => p.isScreenShareEnabled);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Layout Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Participants</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{participants.length} total</Badge>
              <Badge variant={videoParticipants.length > 0 ? "default" : "secondary"}>
                <Video className="w-3 h-3 mr-1" />
                {videoParticipants.length}
              </Badge>
              <Badge variant={audioParticipants.length > 0 ? "default" : "secondary"}>
                <Mic className="w-3 h-3 mr-1" />
                {audioParticipants.length}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Screen Share</div>
            <Badge variant={screenShareActive ? "default" : "secondary"}>
              <Monitor className="w-3 h-3 mr-1" />
              {screenShareActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Layout Quick Switch */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Quick Layout Switch</div>
          <div className="grid grid-cols-2 gap-2">
            {layouts.map((layout) => (
              <Button
                key={layout.type}
                onClick={() => setSelectedLayout(layout.type)}
                variant={selectedLayout === layout.type ? "default" : "outline"}
                size="sm"
                className="justify-start"
              >
                <span className="font-medium">{layout.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {layout.description}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Participant Details */}
        {participants.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Live Participants</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {participants.map((participant) => (
                <div
                  key={participant.identity}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-medium">
                      {participant.name || participant.identity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {participant.isCameraEnabled ? (
                      <Video className="w-3 h-3 text-green-600" />
                    ) : (
                      <VideoOff className="w-3 h-3 text-gray-400" />
                    )}
                    {participant.isMicrophoneEnabled ? (
                      <Mic className="w-3 h-3 text-green-600" />
                    ) : (
                      <MicOff className="w-3 h-3 text-red-500" />
                    )}
                    {participant.isScreenShareEnabled && (
                      <Monitor className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout Recommendations */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            💡 Layout Tip
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {participants.length === 0 && "Join the room to see live video feeds in the layout preview"}
            {participants.length === 1 && !screenShareActive && "Perfect for 'Single' layout"}
            {participants.length === 1 && screenShareActive && "Try 'Single + Screen' layout for presentations"}
            {participants.length === 2 && !screenShareActive && "Great for 'Multi Full' or 'Multi Half' layouts"}
            {participants.length === 2 && screenShareActive && "Perfect for 'VS Mode' competitive layout"}
            {participants.length >= 3 && !screenShareActive && "Consider 'Grid' layout for equal focus"}
            {participants.length >= 3 && screenShareActive && "Use 'Multi + Screen' for group presentations"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
