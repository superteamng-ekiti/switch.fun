"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStreamParticipants } from "@/hooks/use-stream-participants";
import { SimpleCohostInvite } from "./simple-cohost-invite";

interface BackstageParticipantsListProps {
  streamId: string;
  currentUserId: string;
  userRole: string;
}

export function BackstageParticipantsList({
  streamId,
  currentUserId,
  userRole,
}: BackstageParticipantsListProps) {
  const { onlineParticipants, isLoading } = useStreamParticipants(streamId);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filter to only show hosts and co-hosts (memoized to prevent unnecessary re-renders)
  const hostsAndCoHosts = useMemo(
    () => onlineParticipants.filter(
      (p) => p.role === "HOST" || p.role === "CO_HOST"
    ),
    [onlineParticipants]
  );

  const canManageParticipants = userRole === "HOST" || userRole === "CO_HOST";

  if (isLoading) {
    return (
      <div className="w-full h-24 bg-muted/20 rounded-lg border border-border/40 p-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-16 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium font-sans text-muted-foreground">
            Hosts & Co-hosts
          </h3>
          <Badge variant="secondary" className="text-xs">
            {hostsAndCoHosts.length} online
          </Badge>
        </div>
        {canManageParticipants && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setShowInviteModal(true)}
            aria-label="Invite co-host to backstage"
          >
            <UserPlus className="h-3 w-3 mr-1" aria-hidden="true" />
            Invite Co-Host
          </Button>
        )}
      </div>

      {/* Participants List */}
      <div className="w-full h-24 bg-muted/20 rounded-[8px] border border-border/40 overflow-hidden">
        {hostsAndCoHosts.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No hosts online yet</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 overflow-x-auto h-full">
            {hostsAndCoHosts.map((participant) => {
              const isCurrentUser = participant.identity === currentUserId;

              return (
                <div
                  key={participant.identity}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-[4px] transition-colors",
                    "hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary",
                    isCurrentUser && "bg-primary/10"
                  )}
                  onClick={() => {
                    // TODO: Show participant details or actions
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // TODO: Show participant details or actions
                    }
                  }}
                  aria-label={`${participant.user?.username || participant.name}${isCurrentUser ? ' (You)' : ''} - ${participant.role === 'CO_HOST' ? 'Co-host' : 'Host'}`}
                >
                  {/* Avatar with status */}
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage src={participant.user?.imageUrl} />
                      <AvatarFallback className="text-xs">
                        {participant.user?.username?.charAt(0).toUpperCase() ||
                          participant.name?.charAt(0).toUpperCase() ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Speaking indicator */}
                    {participant.isSpeaking && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    )}

                    {/* Mic/Video status */}
                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                      {participant.audioEnabled ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Mic className="h-2.5 w-2.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <MicOff className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="absolute -bottom-1 -left-1 flex gap-0.5">
                      {participant.videoEnabled ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Video className="h-2.5 w-2.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                          <VideoOff className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SimpleCohostInvite
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        streamId={streamId}
      />
    </div>
  );
}
