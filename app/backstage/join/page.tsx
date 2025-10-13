import { Suspense } from "react";
import { SimpleJoinCohost } from "./_components/simple-join-cohost";

export default function JoinBackstagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Suspense fallback={<JoinBackstageLoading />}>
        <SimpleJoinCohost />
      </Suspense>
    </div>
  );
}

function JoinBackstageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading invite...</p>
      </div>
    </div>
  );
}
