"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, AlertCircle, CheckCircle, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { validateInviteToken, joinViaInvite } from "@/actions/backstage-invite";
import { ParticipantRole } from "@prisma/client";

interface InviteInfo {
  id: string;
  streamId: string;
  role: ParticipantRole;
  stream: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    user: {
      username: string;
      imageUrl: string;
    };
  };
}

export function JoinBackstageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No invite token provided");
      setIsLoading(false);
      return;
    }

    validateInviteToken(token)
      .then((result) => {
        if (result.success && result.invite) {
          setInviteInfo(result.invite);
        } else {
          setError(result.error || "Invalid invite");
        }
      })
      .catch((err) => {
        setError("Failed to validate invite");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleJoinBackstage = () => {
    if (!token) return;

    startTransition(async () => {
      try {
        const result = await joinViaInvite(token);

        if (result.success) {
          toast.success(`Joined as ${result.role.toLowerCase()}!`);
          router.push(`/backstage/${result.streamId}`);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to join backstage");
      }
    });
  };

  const getRoleColor = (role: ParticipantRole) => {
    switch (role) {
      case "HOST":
        return "bg-red-500";
      case "CO_HOST":
        return "bg-orange-500";
      case "SPEAKER":
        return "bg-blue-500";
      case "MODERATOR":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleDescription = (role: ParticipantRole) => {
    switch (role) {
      case "HOST":
        return "Full control over the stream and backstage";
      case "CO_HOST":
        return "Help manage the stream and moderate participants";
      case "SPEAKER":
        return "Join the conversation with audio and video";
      case "MODERATOR":
        return "Help moderate chat and manage participants";
      default:
        return "Watch and participate in chat";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Validating invite...</p>
        </div>
      </div>
    );
  }

  if (error || !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Invalid Invite</CardTitle>
            <CardDescription>
              {error || "This invite link is not valid or has expired."}
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
          <CardTitle>You&apos;re Invited to Backstage!</CardTitle>
          <CardDescription>
            Join the backstage area for this stream
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stream Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={inviteInfo.stream.user.imageUrl} />
              <AvatarFallback>
                {inviteInfo.stream.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {inviteInfo.stream.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                by @{inviteInfo.stream.user.username}
              </p>
            </div>
          </div>

          {/* Role Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Role:</span>
              <Badge className={`text-white ${getRoleColor(inviteInfo.role)}`}>
                {inviteInfo.role.replace("_", " ")}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {getRoleDescription(inviteInfo.role)}
            </p>
          </div>

          {/* Join Button */}
          <div className="space-y-3">
            <Button
              onClick={handleJoinBackstage}
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
                  Join Backstage
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
            <p>By joining, you agree to follow the stream guidelines.</p>
            <p>The host can remove you from backstage at any time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
