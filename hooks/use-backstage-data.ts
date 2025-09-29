import { useQuery, useQueries } from "@tanstack/react-query";

interface BackstageUser {
  id: string;
  username: string;
  imageUrl: string;
}

interface StreamParticipant {
  id: string;
  role: "HOST" | "CO_HOST" | "PARTICIPANT";
  status: "JOINED" | "LEFT" | "KICKED";
  user: BackstageUser;
  joinedAt: Date;
  canSpeak: boolean;
  canVideo: boolean;
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

interface BackstageData {
  user: BackstageUser;
  stream: BackstageStream;
  userRole: string;
  isOwner: boolean;
  isAuthorized: boolean;
}

// Optimized user query for backstage (minimal data)
export function useBackstageUser() {
  return useQuery({
    queryKey: ["backstage", "user"],
    queryFn: async (): Promise<BackstageUser> => {
      const response = await fetch(`/api/backstage/user`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Optimized stream query for backstage
export function useBackstageStream(streamId: string) {
  return useQuery({
    queryKey: ["backstage", "stream", streamId],
    queryFn: async (): Promise<BackstageStream> => {
      const response = await fetch(`/api/backstage/stream/${streamId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stream data");
      }
      return response.json();
    },
    enabled: !!streamId,
    staleTime: 30 * 1000, // 30 seconds (more frequent for live data)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Combined hook for all backstage data with parallel fetching
export function useBackstageData(streamId: string) {
  // Parallel queries for optimal performance
  const queries = useQueries({
    queries: [
      {
        queryKey: ["backstage", "user"],
        queryFn: async (): Promise<BackstageUser> => {
          const response = await fetch(`/api/backstage/user`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          return response.json();
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
      {
        queryKey: ["backstage", "stream", streamId],
        queryFn: async (): Promise<BackstageStream> => {
          const response = await fetch(`/api/backstage/stream/${streamId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch stream data");
          }
          return response.json();
        },
        enabled: !!streamId,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchInterval: 30 * 1000,
      },
    ],
  });

  const [userQuery, streamQuery] = queries;

  // Derived state calculations
  const user = userQuery.data;
  const stream = streamQuery.data;
  
  const userParticipant = stream?.participants.find(p => p.user.id === user?.id);
  const isOwner = stream?.user.id === user?.id;
  const isAuthorized = isOwner || (userParticipant && 
    (userParticipant.role === "HOST" || userParticipant.role === "CO_HOST"));
  const userRole = userParticipant?.role || "HOST";

  return {
    // Individual query states
    userQuery,
    streamQuery,
    
    // Combined loading state
    isLoading: userQuery.isLoading || streamQuery.isLoading,
    isError: userQuery.isError || streamQuery.isError,
    error: userQuery.error || streamQuery.error,
    
    // Data
    user,
    stream,
    userRole,
    isOwner,
    isAuthorized,
    
    // Combined data object
    data: (user && stream && isAuthorized) ? {
      user,
      stream,
      userRole,
      isOwner,
      isAuthorized,
    } as BackstageData : null,
  };
}

// Real-time participants hook
export function useBackstageParticipants(streamId: string) {
  return useQuery({
    queryKey: ["backstage", "participants", streamId],
    queryFn: async (): Promise<StreamParticipant[]> => {
      const response = await fetch(`/api/backstage/stream/${streamId}/participants`);
      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }
      return response.json();
    },
    enabled: !!streamId,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 1000, // Real-time updates every 10 seconds
  });
}
