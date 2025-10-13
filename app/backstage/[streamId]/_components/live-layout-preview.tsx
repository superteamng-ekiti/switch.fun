"use client";

import React, { useMemo } from "react";
import { useAtomValue } from "jotai";
import {
  useParticipants,
  VideoTrack,
  ParticipantTile,
  TrackReferenceOrPlaceholder,
  useTracks,
} from "@livekit/components-react";
import { Track, Participant } from "livekit-client";
import { selectedLayoutAtom } from "@/store/backstage-atoms";
import { cn } from "@/lib/utils";
import { Monitor } from "lucide-react";

interface LiveLayoutPreviewProps {
  className?: string;
}

/**
 * Live Layout Preview Component
 *
 * Shows actual video feeds from LiveKit participants in the selected layout.
 * This replaces the iframe-based preview with real video tracks.
 */
export function LiveLayoutPreview({ className }: LiveLayoutPreviewProps) {
  const selectedLayout = useAtomValue(selectedLayoutAtom);
  const participants = useParticipants();

  // Get all video and screen share tracks
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: true },
    { source: Track.Source.ScreenShareAudio, withPlaceholder: false },
  ]);

  // Separate video participants and screen share
  const videoParticipants = participants.filter((p) => !p.isScreenShareEnabled);

  // Find screen share track - try multiple approaches
  const screenShareTrack =
    tracks.find(
      (t) => t.source === Track.Source.ScreenShare && t.publication
    ) || tracks.find((t) => t.source === Track.Source.ScreenShare);

  // Alternative: Check if any participant has screen share enabled
  const hasScreenShare = participants.some((p) => p.isScreenShareEnabled);
  const screenShareParticipant = participants.find(
    (p) => p.isScreenShareEnabled
  );

  // Debug logging for screen share detection
  React.useEffect(() => {
    console.log("[LiveLayoutPreview] === DEBUG INFO ===");
    console.log("[LiveLayoutPreview] Total participants:", participants.length);
    console.log(
      "[LiveLayoutPreview] Participants:",
      participants.map((p) => ({
        identity: p.identity,
        name: p.name,
        isCameraEnabled: p.isCameraEnabled,
        isMicrophoneEnabled: p.isMicrophoneEnabled,
        isScreenShareEnabled: p.isScreenShareEnabled,
        connectionQuality: p.connectionQuality,
      }))
    );

    console.log("[LiveLayoutPreview] Total tracks:", tracks.length);
    console.log(
      "[LiveLayoutPreview] All tracks:",
      tracks.map((t) => ({
        source: t.source,
        participant: t.participant?.identity,
        publication: !!t.publication,
        kind: t.publication?.kind,
      }))
    );

    const screenTracks = tracks.filter(
      (t) => t.source === Track.Source.ScreenShare
    );
    console.log("[LiveLayoutPreview] Screen share tracks:", screenTracks);

    const screenShareParticipants = participants.filter(
      (p) => p.isScreenShareEnabled
    );
    console.log(
      "[LiveLayoutPreview] Participants with screen share:",
      screenShareParticipants.map((p) => p.identity)
    );

    console.log("[LiveLayoutPreview] screenShareTrack:", screenShareTrack);
    console.log("[LiveLayoutPreview] hasScreenShare:", hasScreenShare);
    console.log(
      "[LiveLayoutPreview] screenShareParticipant:",
      screenShareParticipant?.identity
    );
    console.log(
      "[LiveLayoutPreview] videoParticipants:",
      videoParticipants.map((p) => p.identity)
    );
    console.log("[LiveLayoutPreview] === END DEBUG ===");
  }, [
    tracks,
    participants,
    screenShareTrack,
    hasScreenShare,
    screenShareParticipant,
    videoParticipants,
  ]);

  // Render layout based on selected type
  const renderLayout = () => {
    switch (selectedLayout) {
      case "single":
        return renderSingleLayout();
      case "multi-full":
        return renderMultiFullLayout();
      case "multi-half":
        return renderMultiHalfLayout();
      case "grid":
        return renderGridLayout();
      case "single-screen":
        return renderSingleScreenLayout();
      case "multi-screen":
        return renderMultiScreenLayout();
      case "vs-screen":
        return renderVsScreenLayout();
      default:
        return renderSingleLayout();
    }
  };

  // Single streamer layout
  const renderSingleLayout = () => {
    const participant = videoParticipants[0];
    if (!participant) return renderEmptyState();

    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full h-full max-w-4xl">
          <ParticipantVideoTile
            participant={participant}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  };

  // Multi streamer full screen layout
  const renderMultiFullLayout = () => {
    if (videoParticipants.length === 0) return renderEmptyState();

    return (
      <div className="w-full h-full flex gap-2 p-4">
        {videoParticipants.slice(0, 4).map((participant) => (
          <ParticipantVideoTile
            key={participant.identity}
            participant={participant}
            className="flex-1 h-full"
          />
        ))}
      </div>
    );
  };

  // Multi streamer half screen layout
  const renderMultiHalfLayout = () => {
    if (videoParticipants.length === 0) return renderEmptyState();

    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex gap-4 w-3/4 h-3/4">
          {videoParticipants.slice(0, 2).map((participant) => (
            <ParticipantVideoTile
              key={participant.identity}
              participant={participant}
              className="flex-1 h-full"
            />
          ))}
        </div>
      </div>
    );
  };

  // Grid layout
  const renderGridLayout = () => {
    if (videoParticipants.length === 0) return renderEmptyState();

    const participantCount = videoParticipants.length;
    const cols = Math.ceil(Math.sqrt(participantCount));
    const rows = Math.ceil(participantCount / cols);

    return (
      <div
        className="w-full h-full p-4 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {videoParticipants.map((participant) => (
          <ParticipantVideoTile
            key={participant.identity}
            participant={participant}
            className="w-full h-full"
          />
        ))}
      </div>
    );
  };

  // Single streamer with screen share
  const renderSingleScreenLayout = () => {
    const videoParticipant = videoParticipants[0];

    if (!screenShareTrack && !hasScreenShare) {
      return renderSingleLayout();
    }

    return (
      <div className="w-full h-full flex gap-2 p-2">
        {/* Screen share takes main area */}
        <div className="flex-1 h-full">
          {screenShareTrack ? (
            <ScreenShareTile
              track={screenShareTrack}
              className="w-full h-full"
            />
          ) : screenShareParticipant ? (
            <VideoTrack
              participant={screenShareParticipant}
              source={Track.Source.ScreenShare}
              className="w-full h-full object-contain bg-black rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-white/70 text-center">
                <Monitor className="w-12 h-12 mx-auto mb-2" />
                <p>Screen Share Active</p>
              </div>
            </div>
          )}
        </div>

        {/* Video participant in sidebar */}
        {videoParticipant && (
          <div className="w-80 h-60 mt-4">
            <ParticipantVideoTile
              participant={videoParticipant}
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    );
  };

  // Multi streamer with screen share
  const renderMultiScreenLayout = () => {
    if (!screenShareTrack && !hasScreenShare) {
      return renderMultiFullLayout();
    }

    return (
      <div className="w-full h-full flex flex-col gap-2 p-2">
        {/* Screen share takes top area */}
        <div className="w-full h-2/3">
          {screenShareTrack ? (
            <ScreenShareTile
              track={screenShareTrack}
              className="w-full h-full"
            />
          ) : screenShareParticipant ? (
            <VideoTrack
              participant={screenShareParticipant}
              source={Track.Source.ScreenShare}
              className="w-full h-full object-contain bg-black rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-white/70 text-center">
                <Monitor className="w-12 h-12 mx-auto mb-2" />
                <p>Screen Share Active</p>
              </div>
            </div>
          )}
        </div>

        {/* Video participants in bottom row */}
        <div className="w-full h-1/3 flex gap-2">
          {videoParticipants.slice(0, 4).map((participant) => (
            <ParticipantVideoTile
              key={participant.identity}
              participant={participant}
              className="flex-1 h-full"
            />
          ))}
        </div>
      </div>
    );
  };

  // VS layout (2 streamers + screen share)
  const renderVsScreenLayout = () => {
    const leftParticipant = videoParticipants[0];
    const rightParticipant = videoParticipants[1];

    if (
      (!screenShareTrack && !hasScreenShare) ||
      !leftParticipant ||
      !rightParticipant
    ) {
      return renderMultiScreenLayout();
    }

    return (
      <div className="w-full h-full flex gap-2 p-2">
        {/* Left participant */}
        <div className="w-72 h-full">
          <ParticipantVideoTile
            participant={leftParticipant}
            className="w-full h-full"
          />
        </div>

        {/* Center screen share with VS badge */}
        <div className="flex-1 h-full relative">
          {screenShareTrack ? (
            <ScreenShareTile
              track={screenShareTrack}
              className="w-full h-full"
            />
          ) : screenShareParticipant ? (
            <VideoTrack
              participant={screenShareParticipant}
              source={Track.Source.ScreenShare}
              className="w-full h-full object-contain bg-black rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-white/70 text-center">
                <Monitor className="w-12 h-12 mx-auto mb-2" />
                <p>Screen Share Active</p>
              </div>
            </div>
          )}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-red-500 to-blue-500 px-4 py-2 rounded-full text-white font-bold text-lg z-10">
            VS
          </div>
        </div>

        {/* Right participant */}
        <div className="w-72 h-full">
          <ParticipantVideoTile
            participant={rightParticipant}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  };

  // Empty state when no participants
  const renderEmptyState = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900/50">
      <div className="text-center text-white/70">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-sm font-medium">No participants</p>
        <p className="text-xs">Join the room to see live preview</p>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative bg-black rounded-lg overflow-hidden border border-border/40",
        className
      )}
    >
      {/* Layout content */}
      <div className="w-full h-full">{renderLayout()}</div>

      {/* Overlay info */}
      <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 rounded-full text-xs text-white/90 backdrop-blur-sm">
        <span className="font-medium">{selectedLayout}</span>
        <span className="mx-1">•</span>
        <span>
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""}
        </span>
        {(screenShareTrack || hasScreenShare) && (
          <>
            <span className="mx-1">•</span>
            <span className="text-green-400">Screen Share</span>
          </>
        )}
      </div>

      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600/90 px-2 py-1 rounded-full text-xs text-white backdrop-blur-sm">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        LIVE
      </div>
    </div>
  );
}

/**
 * Participant Video Tile Component
 *
 * Renders a single participant's video with audio indicators and name overlay
 */
interface ParticipantVideoTileProps {
  participant: Participant;
  className?: string;
}

function ParticipantVideoTile({
  participant,
  className,
}: ParticipantVideoTileProps) {
  const isVideoEnabled = participant.isCameraEnabled;
  const isAudioEnabled = participant.isMicrophoneEnabled;
  const isSpeaking = participant.isSpeaking;

  return (
    <div
      className={cn(
        "relative bg-gray-900 rounded-lg overflow-hidden border-2 transition-colors",
        isSpeaking
          ? "border-green-400 shadow-lg shadow-green-400/20"
          : "border-gray-700",
        className
      )}
    >
      {/* Video track */}
      {isVideoEnabled ? (
        <VideoTrack
          participant={participant}
          source={Track.Source.Camera}
          className="w-full h-full object-cover"
        />
      ) : (
        // Avatar placeholder when video is off
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Note: Audio is handled automatically by LiveKit for preview purposes */}

      {/* Participant info overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
        <span className="font-medium">
          {participant.name || participant.identity}
        </span>
      </div>

      {/* Muted indicator */}
      {!isAudioEnabled && (
        <div className="absolute top-2 right-2 bg-red-600/90 p-1 rounded text-white backdrop-blur-sm">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Screen Share Tile Component
 *
 * Renders screen share content
 */
interface ScreenShareTileProps {
  track: TrackReferenceOrPlaceholder;
  className?: string;
}

function ScreenShareTile({ track, className }: ScreenShareTileProps) {
  // Only render if we have a valid track (not a placeholder)
  if (!track.publication) {
    return (
      <div
        className={cn(
          "relative bg-gray-900 rounded-lg overflow-hidden border border-gray-600 flex items-center justify-center",
          className
        )}
      >
        <div className="text-center text-white/70">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 7a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm">No screen share</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative bg-black rounded-lg overflow-hidden border border-gray-600",
        className
      )}
    >
      <VideoTrack trackRef={track} className="w-full h-full object-contain" />

      {/* Screen share indicator */}
      <div className="absolute top-2 left-2 bg-blue-600/90 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
        <svg
          className="w-3 h-3 inline mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 7a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Screen Share
      </div>
    </div>
  );
}
