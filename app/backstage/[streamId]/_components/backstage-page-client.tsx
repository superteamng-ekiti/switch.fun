"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useBackstageComplete } from "@/hooks/use-backstage-complete";
import { BackstageLayout } from "./backstage-layout";
import { BackstageSkeleton } from "./backstage-skeleton";

interface BackstagePageClientProps {
  streamId: string;
}

export const BackstagePageClient = ({ streamId }: BackstagePageClientProps) => {
  const router = useRouter();

  const { data, isLoading, isError, error } = useBackstageComplete(streamId);

  // Handle loading state
  if (isLoading) {
    return <BackstageSkeleton />;
  }

  // Handle error states with better logging
  if (isError) {
    const errorMessage = error?.message || "Unknown error";
    
    // Log the error for debugging
    console.error("[BackstagePageClient] Error:", {
      streamId,
      error: errorMessage,
      fullError: error
    });

    // Handle specific error cases with user feedback
    if (errorMessage.includes("Unauthorized")) {
      console.log("[BackstagePageClient] Redirecting due to unauthorized access");
      router.push("/");
      return null;
    }

    if (errorMessage.includes("not found")) {
      console.log("[BackstagePageClient] Stream not found, redirecting to home");
      router.push("/");
      return null;
    }

    if (errorMessage.includes("Access denied")) {
      console.log("[BackstagePageClient] Access denied, redirecting to home");
      router.push("/");
      return null;
    }

    // Show error UI for other errors instead of silent redirect
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error loading backstage</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If we have data, the API has already validated everything
  // No need for additional checks that cause silent redirects
  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">No data received</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <BackstageLayout
      stream={data.stream}
      currentUser={data.user}
      userRole={data.userRole}
      token={data.token}
      serverUrl={data.serverUrl}
    />
  );
};