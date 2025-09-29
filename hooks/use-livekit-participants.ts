import { useMemo } from "react";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { ConnectionQuality } from "livekit-client";

export interface LiveKitParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  connectionQuality: ConnectionQuality;
  joinedAt?: Date;
  isOnline: boolean;
}

export function useLiveKitParticipants() {
  const room = useRoomContext();
  const participants = useParticipants();
  
  const processedParticipants = useMemo(() => {
    // Handle case where room context is not available yet
    if (!room || !participants) {
      return [];
    }
    
    return participants.map(p => ({
      identity: p.identity,
      name: p.name || p.identity,
      isLocal: p.isLocal,
      isSpeaking: p.isSpeaking,
      audioEnabled: false, // TODO: Implement proper audio track detection
      videoEnabled: false, // TODO: Implement proper video track detection
      connectionQuality: p.connectionQuality,
      joinedAt: p.joinedAt,
      isOnline: true, // All LiveKit participants are online by definition
    }));
  }, [participants, room]);

  const localParticipant = useMemo(() => {
    return processedParticipants.find(p => p.isLocal);
  }, [processedParticipants]);

  const remoteParticipants = useMemo(() => {
    return processedParticipants.filter(p => !p.isLocal);
  }, [processedParticipants]);

  return {
    participants: processedParticipants,
    localParticipant,
    remoteParticipants,
    participantCount: processedParticipants.length,
    isConnected: room?.state === "connected" || false,
    roomName: room?.name,
  };
}
