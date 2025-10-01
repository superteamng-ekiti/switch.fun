import { useEffect } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Room } from "livekit-client";
import {
  mediaStateAtom,
  setAvailableDevicesAtom,
  type MediaDevice,
} from "@/store/backstage-atoms";

// Debug logging only in development
const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : () => {};

/**
 * Hook to sync LiveKit media state with Jotai atoms
 * Handles bidirectional sync between LiveKit tracks and backstage state
 */
export function useBackstageLiveKit() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const mediaState = useAtomValue(mediaStateAtom);
  const setAvailableDevices = useSetAtom(setAvailableDevicesAtom);

  // Sync microphone state with LiveKit
  useEffect(() => {
    if (!localParticipant) {
      log("[useBackstageLiveKit] No local participant yet");
      return;
    }

    const syncMicrophone = async () => {
      try {
        const currentlyEnabled = localParticipant.isMicrophoneEnabled;
        const desiredState = mediaState.isMicEnabled;
        
        log("[useBackstageLiveKit] Mic sync - Current:", currentlyEnabled, "Desired:", desiredState);
        
        if (desiredState !== currentlyEnabled) {
          log("[useBackstageLiveKit] Toggling microphone to:", desiredState);
          await localParticipant.setMicrophoneEnabled(desiredState);
          log("[useBackstageLiveKit] Microphone toggled successfully");
          
          // TODO: Device switching - requires LiveKit SDK update or custom implementation
          // The switchActiveDevice method may not be available in current SDK version
        }
      } catch (error) {
        console.error("[useBackstageLiveKit] Error syncing microphone:", error);
      }
    };

    syncMicrophone();
  }, [localParticipant, mediaState.isMicEnabled, mediaState.selectedMicDevice]);

  // Sync camera state with LiveKit
  useEffect(() => {
    if (!localParticipant) {
      log("[useBackstageLiveKit] No local participant yet");
      return;
    }

    const syncCamera = async () => {
      try {
        const currentlyEnabled = localParticipant.isCameraEnabled;
        const desiredState = mediaState.isCameraEnabled;
        
        log("[useBackstageLiveKit] Camera sync - Current:", currentlyEnabled, "Desired:", desiredState);
        
        if (desiredState !== currentlyEnabled) {
          log("[useBackstageLiveKit] Toggling camera to:", desiredState);
          await localParticipant.setCameraEnabled(desiredState);
          log("[useBackstageLiveKit] Camera toggled successfully");
          
          // TODO: Device switching - requires LiveKit SDK update or custom implementation
        }
      } catch (error) {
        console.error("[useBackstageLiveKit] Error syncing camera:", error);
      }
    };

    syncCamera();
  }, [localParticipant, mediaState.isCameraEnabled, mediaState.selectedCameraDevice]);

  // Sync screen share state with LiveKit
  useEffect(() => {
    if (!localParticipant) return;

    const syncScreenShare = async () => {
      try {
        const currentlySharing = localParticipant.isScreenShareEnabled;
        
        if (mediaState.isScreenSharing !== currentlySharing) {
          await localParticipant.setScreenShareEnabled(mediaState.isScreenSharing);
        }
      } catch (error) {
        console.error("[useBackstageLiveKit] Error syncing screen share:", error);
      }
    };

    syncScreenShare();
  }, [localParticipant, mediaState.isScreenSharing]);

  // Note: Device enumeration is handled by useBackstageMedia hook
  // to avoid duplicate getUserMedia() calls and event listeners
}
