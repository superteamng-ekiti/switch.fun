import { useQuery } from "@tanstack/react-query";

interface BackstageUser {
  id: string;
  username: string;
  imageUrl: string;
}

interface StreamParticipant {
  id: string;
  role: "HOST" | "CO_HOST" | "PARTICIPANT";
  status: "INVITED" | "JOINED" | "LEFT" | "KICKED";
  canSpeak: boolean;
  canVideo: boolean;
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    imageUrl: string;
  };
}

interface BackstageStream {
  id: string;
  title: string | null;
  name: string;
  liveKitRoomName: string | null;
  isPreLive: boolean;
  isLive: boolean;
  streamType: string;
  user: BackstageUser;
  participants: StreamParticipant[];
}

interface BackstageCompleteData {
  user: BackstageUser;
  stream: BackstageStream;
  token: string;
  roomName: string;
  serverUrl: string;
  userRole: string;
  isOwner: boolean;
  isAuthorized: boolean;
}

/**
 * Optimized hook that fetches ALL backstage data in ONE API call
 * Replaces useBackstageData + useBackstageToken
 * 
 * Performance: 2-3 seconds vs 60+ seconds for separate calls
 */
export function useBackstageComplete(streamId: string) {
  return useQuery({
    queryKey: ["backstage", "complete", streamId],
    queryFn: async (): Promise<BackstageCompleteData> => {
      const response = await fetch(`/api/backstage/stream/${streamId}/complete`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch backstage data");
      }
      
      return response.json();
    },
    enabled: !!streamId,
    staleTime: 2 * 60 * 1000, // 2 minutes (data doesn't change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && 
          (error.message.includes("Unauthorized") || 
           error.message.includes("Access denied") ||
           error.message.includes("Stream not found"))) {
        return false;
      }
      return failureCount < 2;
    },
    // Add meta for better error tracking
    meta: {
      errorMessage: "Failed to load backstage. Please try refreshing the page.",
    },
  });
}
