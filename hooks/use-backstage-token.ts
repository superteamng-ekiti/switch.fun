import { useQuery } from "@tanstack/react-query";

interface BackstageTokenData {
  token: string;
  roomName: string;
  serverUrl: string;
}

export function useBackstageToken(streamId: string) {
  return useQuery({
    queryKey: ["backstage", "token", streamId],
    queryFn: async (): Promise<BackstageTokenData> => {
      const response = await fetch(`/api/backstage/stream/${streamId}/token`);
      if (!response.ok) {
        throw new Error("Failed to fetch access token");
      }
      return response.json();
    },
    enabled: !!streamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        return false;
      }
      if (error instanceof Error && error.message.includes("Access denied")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
