"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { joinAsCohostViaInvite } from "@/actions/cohost-invite";

interface StreamInfo {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  user: {
    username: string;
    imageUrl: string;
  };
}

export function SimpleJoinCohost() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No invite token provided");
      setIsLoading(false);
      return;
    }

    // For now, we'll validate on join. In a real app, you might want to validate first
    setIsLoading(false);
  }, [token]);

  const handleJoinAsCohost = () => {
    if (!token) return;

    startTransition(async () => {
      try {
        const result = await joinAsCohostViaInvite(token);
        
        if (result.success) {
          toast.success("Joined as co-host!");
          router.push(`/backstage/${result.streamId}`);
        } else {
          setError(result.error || "Failed to join");
        }
      } catch (error: any) {
        setError(error.message || "Failed to join as co-host");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Invalid Invite</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/")}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>You&apos;re Invited as Co-Host!</CardTitle>
          <CardDescription>
            Join the backstage area as a co-host for this stream
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Co-Host Info */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                Co-Host Role
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Help manage the stream and backstage</p>
              <p>• Join with audio and video capabilities</p>
              <p>• Moderate participants and chat</p>
              <p>• Assist with stream controls</p>
            </div>
          </div>

          {/* Join Button */}
          <div className="space-y-3">
            <Button 
              onClick={handleJoinAsCohost}
              disabled={isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Join as Co-Host
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push("/")}
            >
              Maybe Later
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>By joining, you agree to help manage the stream responsibly.</p>
            <p>The host can remove you from backstage at any time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
