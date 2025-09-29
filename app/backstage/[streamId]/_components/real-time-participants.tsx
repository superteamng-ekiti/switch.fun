"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  UserPlus,
  Wifi,
  WifiOff,
  Volume2
} from "lucide-react";
import { useStreamParticipants } from "@/hooks/use-stream-participants";
import { cn } from "@/lib/utils";

interface RealTimeParticipantsProps {
  streamId: string;
  currentUserId: string;
  userRole: string;
}

export const RealTimeParticipants = ({ 
  streamId, 
  currentUserId, 
  userRole 
}: RealTimeParticipantsProps) => {
  const { 
    participants, 
    onlineParticipants,
    offlineParticipants,
    onlineCount, 
    totalCount,
    isConnected,
    isLoading 
  } = useStreamParticipants(streamId);

  const canManageParticipants = userRole === "HOST" || userRole === "CO_HOST";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="w-20 h-4 bg-muted rounded mb-1" />
                  <div className="w-16 h-3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({onlineCount} online, {totalCount} total)
          </div>
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
            
            {/* Invite Button */}
            {canManageParticipants && (
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Online Participants */}
        {onlineParticipants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-600">
                Online ({onlineParticipants.length})
              </span>
            </div>
            {onlineParticipants.map((participant) => (
              <ParticipantItem
                key={participant.identity}
                participant={participant}
                currentUserId={currentUserId}
                canManage={canManageParticipants}
                isOnline={true}
              />
            ))}
          </div>
        )}

        {/* Offline Participants */}
        {offlineParticipants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm font-medium text-muted-foreground">
                Invited ({offlineParticipants.length})
              </span>
            </div>
            {offlineParticipants.map((participant) => (
              <ParticipantItem
                key={participant.identity}
                participant={participant}
                currentUserId={currentUserId}
                canManage={canManageParticipants}
                isOnline={false}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {participants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No participants yet</p>
            <p className="text-xs">Invite people to join your stream</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ParticipantItemProps {
  participant: any;
  currentUserId: string;
  canManage: boolean;
  isOnline: boolean;
}

const ParticipantItem = ({ 
  participant, 
  currentUserId, 
  canManage, 
  isOnline 
}: ParticipantItemProps) => {
  const isCurrentUser = participant.identity === currentUserId;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {/* Avatar with Online Status */}
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarImage src={participant.user?.imageUrl} />
            <AvatarFallback className="text-xs">
              {participant.user?.username?.charAt(0).toUpperCase() || 
               participant.name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>

        {/* Participant Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">
              @{participant.user?.username || participant.name}
              {isCurrentUser && (
                <span className="text-xs text-muted-foreground ml-1">(You)</span>
              )}
            </p>
            {participant.isSpeaking && (
              <Volume2 className="h-3 w-3 text-green-500 animate-pulse" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={participant.isHost ? "default" : "outline"} 
              className="text-xs"
            >
              {participant.role.replace("_", " ")}
            </Badge>
            
            {isOnline && (
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

      {/* Management Controls */}
      {canManage && !isCurrentUser && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              participant.canSpeak ? "text-green-600" : "text-muted-foreground"
            )}
            title={participant.canSpeak ? "Revoke mic permission" : "Grant mic permission"}
          >
            <Mic className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0",
              participant.canVideo ? "text-green-600" : "text-muted-foreground"
            )}
            title={participant.canVideo ? "Revoke camera permission" : "Grant camera permission"}
          >
            <Video className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
