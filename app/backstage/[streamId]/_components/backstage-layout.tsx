"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  Play, 
  UserPlus, 
  Mic, 
  Video,
  Monitor,
  Clock
} from "lucide-react";

interface Stream {
  id: string;
  title: string | null;
  name: string;
  liveKitRoomName: string | null;
  isPreLive: boolean;
  isLive: boolean;
  user: {
    id: string;
    username: string;
    imageUrl: string;
  };
  participants: Array<{
    id: string;
    role: string;
    status: string;
    user: {
      id: string;
      username: string;
      imageUrl: string;
    };
  }>;
}

interface BackstageLayoutProps {
  stream: Stream;
  currentUser: {
    id: string;
    username: string;
  };
  userRole: string;
}

export const BackstageLayout = ({ stream, currentUser, userRole }: BackstageLayoutProps) => {
  const [isGoingLive, setIsGoingLive] = useState(false);

  const handleGoLive = async () => {
    setIsGoingLive(true);
    // TODO: Implement go live functionality
    console.log("Going live...");
  };

  const coHosts = stream.participants.filter(p => p.role === "CO_HOST");
  const isHost = userRole === "HOST";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Monitor className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Backstage</h1>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pre-Live
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                onClick={handleGoLive}
                disabled={isGoingLive}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="h-4 w-4 mr-2" />
                {isGoingLive ? "Going Live..." : "Go Live"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stream Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Stream Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-lg font-medium">{stream.title || stream.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Streamer</label>
                  <p className="font-medium">@{stream.user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Room ID</label>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {stream.liveKitRoomName}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stream Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Stream Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Camera preview will appear here</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Enable Camera
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mic className="h-4 w-4 mr-2" />
                        Enable Mic
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants ({stream.participants.length})
                  </div>
                  {isHost && (
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stream.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {participant.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">@{participant.user.username}</p>
                        <Badge variant="outline" className="text-xs">
                          {participant.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />
                    </div>
                  </div>
                ))}
                
                {stream.participants.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No participants yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Stream Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Co-hosts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Monitor className="h-4 w-4 mr-2" />
                  Test Stream
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
