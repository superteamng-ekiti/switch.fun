"use client";

import React from "react";
import { MockLayoutPreview } from "./layout-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type StreamLayoutType } from "@/lib/livekit-layouts";

/**
 * Layout Showcase Component
 * 
 * Shows all available layouts with mock data for demonstration
 * Useful for testing and showcasing layout capabilities
 */
export function LayoutShowcase() {
  const layouts: Array<{
    type: StreamLayoutType;
    title: string;
    description: string;
    participants: number;
    hasScreenShare: boolean;
  }> = [
    {
      type: "single",
      title: "Single Streamer",
      description: "Perfect for solo content creation",
      participants: 1,
      hasScreenShare: false,
    },
    {
      type: "multi-full",
      title: "Multi Full Screen",
      description: "Side-by-side conversation layout",
      participants: 2,
      hasScreenShare: false,
    },
    {
      type: "multi-half",
      title: "Multi Half Screen",
      description: "Intimate conversation layout",
      participants: 2,
      hasScreenShare: false,
    },
    {
      type: "grid",
      title: "Grid View",
      description: "Equal focus for all participants",
      participants: 4,
      hasScreenShare: false,
    },
    {
      type: "single-screen",
      title: "Single + Screen Share",
      description: "Presentation with host camera",
      participants: 1,
      hasScreenShare: true,
    },
    {
      type: "multi-screen",
      title: "Multi + Screen Share",
      description: "Group presentation layout",
      participants: 3,
      hasScreenShare: true,
    },
    {
      type: "vs-screen",
      title: "VS Layout",
      description: "Competitive 1v1 with shared content",
      participants: 2,
      hasScreenShare: true,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Layout Showcase</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preview of all available streaming layouts
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {layouts.map((layout) => (
            <div key={layout.type} className="space-y-2">
              <MockLayoutPreview
                layoutType={layout.type}
                participantCount={layout.participants}
                hasScreenShare={layout.hasScreenShare}
                className="w-full"
              />
              <div className="text-center">
                <h4 className="text-sm font-medium">{layout.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {layout.description}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {layout.participants} participant{layout.participants !== 1 ? 's' : ''}
                  {layout.hasScreenShare && ' + screen share'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
