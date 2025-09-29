import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ConnectionQuality } from "livekit-client";
import { useLiveKitParticipants, LiveKitParticipant } from "./use-livekit-participants";

interface DbParticipant {
  id: string;
  role: "HOST" | "CO_HOST" | "PARTICIPANT" | "VIEWER";
  status: "INVITED" | "JOINED" | "LEFT" | "KICKED";
  canSpeak: boolean;
  canVideo: boolean;
  joinedAt: Date | null;
  leftAt: Date | null;
  user: {
    id: string;
    username: string;
    imageUrl: string;
  };
}

export interface StreamParticipant extends LiveKitParticipant {
  // Database fields
  role: "HOST" | "CO_HOST" | "PARTICIPANT" | "VIEWER";
  status: "INVITED" | "JOINED" | "LEFT" | "KICKED";
  canSpeak: boolean;
  canVideo: boolean;
  dbJoinedAt: Date | null;
  leftAt: Date | null;
  user?: {
    id: string;
    username: string;
    imageUrl: string;
  };
  // Computed fields
  isHost: boolean;
  canManageStream: boolean;
}

async function fetchDbParticipants(streamId: string): Promise<DbParticipant[]> {
  const response = await fetch(`/api/backstage/stream/${streamId}/participants`);
  if (!response.ok) {
    throw new Error("Failed to fetch participants");
  }
  return response.json();
}

export function useStreamParticipants(streamId: string) {
  // Database participants (roles, permissions, persistent data)
  const { data: dbParticipants = [], isLoading: dbLoading, error: dbError } = useQuery({
    queryKey: ["participants", "db", streamId],
    queryFn: () => fetchDbParticipants(streamId),
    staleTime: 2 * 60 * 1000, // 2 minutes (relatively stable data)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!streamId,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }
      return failureCount < 2;
    },
  });
  
  // LiveKit participants (real-time presence, audio/video status)
  const liveKitParticipants = useLiveKitParticipants();
  
  // Merge database and LiveKit data
  const mergedParticipants = useMemo((): StreamParticipant[] => {
    // Start with LiveKit participants (currently online)
    const liveParticipants = liveKitParticipants.participants.map(liveParticipant => {
      const dbParticipant = dbParticipants.find(
        db => db.user.id === liveParticipant.identity
      );
      
      const role = dbParticipant?.role || "VIEWER";
      
      return {
        // LiveKit real-time data
        ...liveParticipant,
        
        // Database persistent data
        role,
        status: "JOINED" as const,
        canSpeak: dbParticipant?.canSpeak || false,
        canVideo: dbParticipant?.canVideo || false,
        dbJoinedAt: dbParticipant?.joinedAt || null,
        leftAt: null,
        user: dbParticipant?.user,
        
        // Computed fields
        isHost: role === "HOST",
        canManageStream: role === "HOST" || role === "CO_HOST",
      };
    });
    
    // Add offline participants from database (invited but not joined)
    const offlineParticipants = dbParticipants
      .filter(dbParticipant => 
        !liveKitParticipants.participants.some(live => live.identity === dbParticipant.user.id) &&
        dbParticipant.status === "INVITED"
      )
      .map(dbParticipant => ({
        // Default LiveKit-like structure for offline participants
        identity: dbParticipant.user.id,
        name: dbParticipant.user.username,
        isLocal: false,
        isSpeaking: false,
        audioEnabled: false,
        videoEnabled: false,
        connectionQuality: ConnectionQuality.Unknown,
        joinedAt: undefined,
        isOnline: false,
        
        // Database persistent data
        role: dbParticipant.role,
        status: dbParticipant.status,
        canSpeak: dbParticipant.canSpeak,
        canVideo: dbParticipant.canVideo,
        dbJoinedAt: dbParticipant.joinedAt,
        leftAt: dbParticipant.leftAt,
        user: dbParticipant.user,
        
        // Computed fields
        isHost: dbParticipant.role === "HOST",
        canManageStream: dbParticipant.role === "HOST" || dbParticipant.role === "CO_HOST",
      }));
    
    return [...liveParticipants, ...offlineParticipants];
  }, [liveKitParticipants.participants, dbParticipants]);
  
  // Separate participants by status
  const onlineParticipants = useMemo(() => 
    mergedParticipants.filter(p => p.isOnline), 
    [mergedParticipants]
  );
  
  const offlineParticipants = useMemo(() => 
    mergedParticipants.filter(p => !p.isOnline), 
    [mergedParticipants]
  );
  
  const hostParticipants = useMemo(() => 
    mergedParticipants.filter(p => p.isHost), 
    [mergedParticipants]
  );
  
  const coHostParticipants = useMemo(() => 
    mergedParticipants.filter(p => p.role === "CO_HOST"), 
    [mergedParticipants]
  );

  return {
    // All participants
    participants: mergedParticipants,
    
    // Filtered participants
    onlineParticipants,
    offlineParticipants,
    hostParticipants,
    coHostParticipants,
    
    // Counts
    onlineCount: liveKitParticipants.participantCount,
    totalCount: mergedParticipants.length,
    invitedCount: offlineParticipants.length,
    
    // LiveKit connection status
    isConnected: liveKitParticipants.isConnected,
    roomName: liveKitParticipants.roomName,
    
    // Loading states
    isLoading: dbLoading,
    error: dbError,
  };
}
