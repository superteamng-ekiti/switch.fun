"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { useParticipants } from "@livekit/components-react";
import { selectedLayoutAtom } from "@/store/backstage-atoms";
import { 
  generateLayoutComposition, 
  convertLiveKitParticipants,
  type StreamLayoutType 
} from "@/lib/livekit-layouts";

interface LayoutPreviewProps {
  className?: string;
}

/**
 * Layout Preview Component
 * 
 * Shows a real-time preview of how the stream layout will look
 * based on current participants and selected layout type.
 */
export function LayoutPreview({ className }: LayoutPreviewProps) {
  const selectedLayout = useAtomValue(selectedLayoutAtom);
  const liveKitParticipants = useParticipants();
  
  // Convert LiveKit participants to our layout format
  const participants = convertLiveKitParticipants(liveKitParticipants);
  
  // Generate the composition for preview
  const composition = generateLayoutComposition(
    selectedLayout as StreamLayoutType, 
    participants
  );

  // Create a scaled-down version for preview
  const previewScale = 0.4; // 40% of original size
  const previewWidth = composition.width * previewScale;
  const previewHeight = composition.height * previewScale;

  return (
    <div className={className}>
      <div className="relative bg-black rounded-lg overflow-hidden border border-border/40">
        {/* Preview iframe with scaled composition */}
        <div 
          style={{
            width: previewWidth,
            height: previewHeight,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>${composition.css}</style>
                </head>
                <body>
                  ${composition.html}
                </body>
              </html>
            `}
            width={composition.width}
            height={composition.height}
            style={{
              border: 'none',
              background: '#0a0a0a',
            }}
            title="Layout Preview"
          />
        </div>
        
        {/* Overlay info */}
        <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
          {selectedLayout} • {participants.length} participants
        </div>
        
        {/* No participants message */}
        {participants.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white/70">
              <p className="text-sm">No participants</p>
              <p className="text-xs">Join the room to see preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mock Layout Preview Component
 * 
 * Shows a static preview with mock participants for design purposes
 */
interface MockLayoutPreviewProps {
  layoutType: StreamLayoutType;
  participantCount?: number;
  hasScreenShare?: boolean;
  className?: string;
}

export function MockLayoutPreview({ 
  layoutType, 
  participantCount = 2, 
  hasScreenShare = false,
  className 
}: MockLayoutPreviewProps) {
  // Generate mock participants
  const mockParticipants = Array.from({ length: participantCount }, (_, i) => ({
    identity: `participant-${i + 1}`,
    name: `User ${i + 1}`,
    hasVideo: true,
    hasAudio: i === 0, // First participant is speaking
    isScreenShare: false,
  }));

  // Add screen share participant if needed
  if (hasScreenShare) {
    mockParticipants.push({
      identity: 'screen-share',
      name: 'Screen Share',
      hasVideo: true,
      hasAudio: false,
      isScreenShare: true,
    });
  }

  const composition = generateLayoutComposition(layoutType, mockParticipants);
  
  // Smaller scale for mock previews
  const previewScale = 0.25;
  const previewWidth = composition.width * previewScale;
  const previewHeight = composition.height * previewScale;

  return (
    <div className={className}>
      <div 
        className="relative bg-black rounded border border-border/20 overflow-hidden"
        style={{
          width: previewWidth,
          height: previewHeight,
        }}
      >
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
              <head>
                <style>${composition.css}</style>
              </head>
              <body>
                ${composition.html.replace(/data-lk-participant-identity="[^"]*"/g, '')}
              </body>
            </html>
          `}
          width={composition.width}
          height={composition.height}
          style={{
            border: 'none',
            background: '#0a0a0a',
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}
          title={`${layoutType} Layout Preview`}
        />
      </div>
    </div>
  );
}
