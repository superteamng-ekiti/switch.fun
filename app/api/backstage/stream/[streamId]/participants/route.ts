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

    // Get participants with caching for performance
    const participants = await getCachedData({
      key: `participants:stream:${params.streamId}`,
      ttl: 60, // 1 minute cache for participant data
      fetchFn: async () => {
        // First verify the user has access to this stream
        const stream = await db.stream.findUnique({
          where: { id: params.streamId },
          select: {
            id: true,
            userId: true,
            participants: {
              where: { userId: self.id },
              select: { role: true },
              take: 1,
            },
          },
        });

        if (!stream) {
          throw new Error("Stream not found");
        }

        // Check authorization
        const userParticipant = stream.participants[0];
        const isOwner = stream.userId === self.id;
        const isAuthorized = isOwner || (userParticipant && 
          (userParticipant.role === "HOST" || userParticipant.role === "CO_HOST"));

        if (!isAuthorized) {
          throw new Error("Access denied");
        }

        // Fetch all participants for this stream
        return db.streamParticipant.findMany({
          where: { streamId: params.streamId },
          select: {
            id: true,
            role: true,
            status: true,
            canSpeak: true,
            canVideo: true,
            joinedAt: true,
            leftAt: true,
            user: {
              select: {
                id: true,
                username: true,
                imageUrl: true,
              },
            },
          },
          orderBy: [
            { role: "asc" }, // HOST first, then CO_HOST, etc.
            { joinedAt: "asc" }, // Then by join time
          ],
        });
      },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error(`[API] /api/backstage/stream/${params.streamId}/participants error:`, error);
    
    if (error instanceof Error) {
      if (error.message === "Stream not found") {
        return NextResponse.json(
          { error: "Stream not found" },
          { status: 404 }
        );
      }
      
      if (error.message === "Access denied") {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
