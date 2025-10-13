"use client";

import React, { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { selectedLayoutAtom } from "@/store/backstage-atoms";
import { useLayoutComposition } from "@/hooks/use-layout-composition";
import { Play, Square, Users, Monitor, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutControlPanelProps {
  streamId: string;
}

/**
 * Layout Control Panel Component
 * 
 * Provides controls for:
 * - Layout selection and preview
 * - Egress start/stop (recording/streaming)
 * - Layout recommendations
 * - Participant management
 */
export function LayoutControlPanel({ streamId }: LayoutControlPanelProps) {
  const [selectedLayout, setSelectedLayout] = useAtom(selectedLayoutAtom);
  const [isEgressActive, setIsEgressActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    participants,
    composition,
    startEgress,
    stopEgress,
    getLayoutRecommendations,
    hasParticipants,
    hasScreenShare,
    participantCount,
  } = useLayoutComposition();

  const recommendations = getLayoutRecommendations();

  const handleStartEgress = async () => {
    setIsLoading(true);
    try {
      const result = await startEgress();
      if (result) {
        setIsEgressActive(true);
        console.log("Egress started successfully");
      }
    } catch (error) {
      console.error("Failed to start egress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopEgress = async () => {
    setIsLoading(true);
    try {
      await stopEgress();
      setIsEgressActive(false);
      console.log("Egress stopped successfully");
    } catch (error) {
      console.error("Failed to stop egress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRecommendation = (layoutType: string) => {
    setSelectedLayout(layoutType as any);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Layout Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
              {hasScreenShare && ' + screen share'}
            </span>
          </div>
          <Badge variant={hasParticipants ? "default" : "secondary"}>
            {hasParticipants ? "Active" : "Waiting"}
          </Badge>
        </div>

        <Separator />

        {/* Current Layout Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Layout:</span>
            <Badge variant="outline">{selectedLayout}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Resolution: {composition.width} × {composition.height}
          </div>
        </div>

        {/* Egress Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stream Output:</span>
            <Badge variant={isEgressActive ? "destructive" : "secondary"}>
              {isEgressActive ? "Recording" : "Stopped"}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            {!isEgressActive ? (
              <Button
                onClick={handleStartEgress}
                disabled={!hasParticipants || isLoading}
                size="sm"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopEgress}
                disabled={isLoading}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>

        {/* Layout Recommendations */}
        {recommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-medium">Recommendations:</span>
              </div>
              
              <div className="space-y-2">
                {recommendations.slice(0, 2).map((rec, index) => (
                  <div
                    key={rec.layout}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{rec.layout}</div>
                      <div className="text-xs text-muted-foreground">
                        {rec.reason}
                      </div>
                    </div>
                    {selectedLayout !== rec.layout && (
                      <Button
                        onClick={() => handleApplyRecommendation(rec.layout)}
                        size="sm"
                        variant="outline"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Participant List */}
        {participants.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="text-sm font-medium">Live Participants:</span>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.identity}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {participant.isScreenShare ? (
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <Monitor className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          participant.hasVideo ? "bg-green-600" : "bg-gray-600"
                        )}>
                          <Users className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-medium">{participant.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {participant.isScreenShare ? "Screen Share" : "Camera"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        participant.hasVideo ? "bg-green-400" : "bg-gray-400"
                      )} title={participant.hasVideo ? "Video On" : "Video Off"} />
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        participant.hasAudio ? "bg-green-400" : "bg-red-400"
                      )} title={participant.hasAudio ? "Audio On" : "Audio Off"} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* No Participants Message */}
        {!hasParticipants && (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No participants in the room</p>
            <p className="text-xs">Layout preview will show when participants join</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
