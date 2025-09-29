import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { getCachedData } from "@/lib/redis";

interface RouteParams {
  params: {
    streamId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const self = await getSelf();
    
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get stream with optimized query for backstage
    const stream = await getCachedData({
      key: `backstage:stream:${params.streamId}`,
      ttl: 30, // 30 seconds for live data
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
            participants: {
              select: {
                id: true,
                role: true,
                status: true,
                joinedAt: true,
                canSpeak: true,
                canVideo: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    imageUrl: true,
                  },
                },
              },
              orderBy: {
                joinedAt: "asc",
              },
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

    // Check authorization
    const userParticipant = stream.participants.find(p => p.user.id === self.id);
    const isOwner = stream.userId === self.id;
    const isAuthorized = isOwner || (userParticipant && 
      (userParticipant.role === "HOST" || userParticipant.role === "CO_HOST"));

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

    return NextResponse.json(stream);
  } catch (error) {
    console.error(`[API] /api/backstage/stream/${params.streamId} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch stream data" },
      { status: 500 }
    );
  }
}
