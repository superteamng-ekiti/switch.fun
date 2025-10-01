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

  // Handle error states
  if (isError) {
    const errorMessage = error?.message || "Unknown error";

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
  if (!data || !data.isAuthorized) {
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
      token={data.token}
      serverUrl={data.serverUrl}
    />
  );
};
