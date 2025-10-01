import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

interface RouteParams {
  params: {
    streamId: string;
  };
}

/**
 * Combined backstage endpoint - returns all data in ONE request
 * Replaces 4 separate API calls with 1 optimized call
 * Expected response time: 2-3 seconds (vs 60+ seconds for separate calls)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Single authentication check
    const self = await getSelf();
    
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Single optimized database query with caching
    const stream = await getCachedData({
      key: `backstage:complete:${params.streamId}:${self.id}`,
      ttl: 120, // 2 minutes cache
      fetchFn: async () => {
        return db.stream.findUnique({
          where: { id: params.streamId },
          select: {
            id: true,
            title: true,
            name: true,
            liveKitRoomName: true,
            isPreLive: true,
            isLive: true,
            streamType: true,
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                imageUrl: true,
              },
            },
            // Only fetch current user's participant record
            participants: {
              where: { userId: self.id },
              select: {
                id: true,
                role: true,
                status: true,
                canSpeak: true,
                canVideo: true,
                joinedAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    imageUrl: true,
                  },
                },
              },
              take: 1,
            },
          },
        });
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    // Authorization check
    const userParticipant = stream.participants[0];
    const isOwner = stream.userId === self.id;
    const isAuthorized = isOwner || (userParticipant && 
      (userParticipant.role === "HOST" || userParticipant.role === "CO_HOST") &&
      userParticipant.status === "JOINED");

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Only allow browser streams in backstage
    if (stream.streamType !== "BROWSER") {
      return NextResponse.json(
        { error: "Invalid stream type" },
        { status: 400 }
      );
    }

    // Generate LiveKit access token
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("[BackstageComplete] LiveKit credentials not configured");
      return NextResponse.json(
        { error: "Streaming service not configured" },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: self.id,
      name: self.username,
    });

    // Generate or use existing room name
    const roomName = stream.liveKitRoomName || `browser_${stream.userId}_${Date.now()}`;
    
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isOwner, // Only stream owner gets admin rights
    });

    const accessToken = token.toJwt();

    // Return complete backstage data in ONE response
    return NextResponse.json({
      user: {
        id: self.id,
        username: self.username,
        imageUrl: self.imageUrl,
      },
      stream: {
        id: stream.id,
        title: stream.title,
        name: stream.name,
        liveKitRoomName: stream.liveKitRoomName,
        isPreLive: stream.isPreLive,
        isLive: stream.isLive,
        streamType: stream.streamType,
        user: stream.user,
        participants: stream.participants,
      },
      token: accessToken,
      roomName,
      serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
      userRole: userParticipant?.role || "HOST",
      isOwner,
      isAuthorized: true,
    });

  } catch (error) {
    console.error(`[API] /api/backstage/stream/${params.streamId}/complete error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch backstage data" },
      { status: 500 }
    );
  }
}
