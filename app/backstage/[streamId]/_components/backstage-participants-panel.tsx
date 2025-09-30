"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BackstageParticipantsPanelProps {
  streamId: string;
  currentUserId: string;
  userRole: string;
}

export function BackstageParticipantsPanel({
  streamId,
  currentUserId,
  userRole,
}: BackstageParticipantsPanelProps) {
  // TODO: Get participants from LiveKit
  const participants = [
    {
      id: "1",
      username: "host_user",
      role: "HOST",
      isOnline: true,
      audioEnabled: true,
      videoEnabled: true,
      imageUrl: null,
    },
  ];

  const canManageParticipants = userRole === "HOST" || userRole === "CO_HOST";

  const handleInviteParticipant = () => {
    // TODO: Open invite modal
    console.log("Invite participant");
  };

  const handleManageParticipant = (participantId: string, action: string) => {
    // TODO: Implement participant management
    console.log(`${action} participant:`, participantId);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({participants.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              {participants.filter((p) => p.isOnline).length} online
            </p>
          </div>
          {canManageParticipants && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInviteParticipant}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          )}
        </div>
      </div>

      {/* Participants List */}
      <ScrollArea className="flex-1">
        {participants.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No participants yet</p>
              <p className="text-xs mt-1">Invite people to join</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.imageUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {participant.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        @{participant.username}
                      </p>
                      {participant.id === currentUserId && (
                        <span className="text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          participant.role === "HOST" ? "default" : "outline"
                        }
                        className="text-xs"
                      >
                        {participant.role.replace("_", " ")}
                      </Badge>
                      {participant.isOnline && (
                        <div className="flex items-center gap-1">
                          {participant.audioEnabled ? (
                            <Mic className="h-3 w-3 text-green-500" />
                          ) : (
                            <MicOff className="h-3 w-3 text-muted-foreground" />
                          )}
                          {participant.videoEnabled ? (
                            <Video className="h-3 w-3 text-green-500" />
                          ) : (
                            <VideoOff className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canManageParticipants && participant.id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleManageParticipant(participant.id, "mute")
                        }
                      >
                        <MicOff className="h-4 w-4 mr-2" />
                        Mute
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleManageParticipant(participant.id, "disable-video")
                        }
                      >
                        <VideoOff className="h-4 w-4 mr-2" />
                        Disable Video
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleManageParticipant(participant.id, "remove")
                        }
                        className="text-destructive"
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
