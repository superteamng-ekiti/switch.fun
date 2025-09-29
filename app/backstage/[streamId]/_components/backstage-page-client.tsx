"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useBackstageData } from "@/hooks/use-backstage-data";
import { useBackstageToken } from "@/hooks/use-backstage-token";
import { BackstageLayout } from "./backstage-layout";
import { Loader2 } from "lucide-react";

interface BackstagePageClientProps {
  streamId: string;
}

export const BackstagePageClient = ({ streamId }: BackstagePageClientProps) => {
  const router = useRouter();
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    userQuery, 
    streamQuery 
  } = useBackstageData(streamId);
  
  const { 
    data: tokenData, 
    isLoading: tokenLoading, 
    isError: tokenError,
    error: tokenErrorMessage
  } = useBackstageToken(streamId);

  // Handle loading state
  if (isLoading || tokenLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading backstage...</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (isError || tokenError) {
    const errorMessage = error?.message || tokenErrorMessage?.message || "Unknown error";
    
    // Handle specific error cases
    if (errorMessage.includes("Unauthorized")) {
      router.push("/");
      return null;
    }
    
    if (errorMessage.includes("not found")) {
      router.push("/");
      return null;
    }
    
    if (errorMessage.includes("Access denied")) {
      router.push("/");
      return null;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error loading backstage</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized access
  if (!data || !data.isAuthorized || !tokenData) {
    router.push("/");
    return null;
  }

  // Handle non-browser streams
  if (data.stream.streamType !== "BROWSER") {
    router.push(`/u/${data.stream.user.username}`);
    return null;
  }

  return (
    <BackstageLayout 
      stream={data.stream}
      currentUser={data.user}
      userRole={data.userRole}
      token={tokenData.token}
      serverUrl={tokenData.serverUrl}
    />
  );
};
