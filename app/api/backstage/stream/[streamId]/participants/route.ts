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

    // Optimized: Single query with authorization check and participant fetch
    const participants = await getCachedData({
      key: `participants:stream:${params.streamId}:${self.id}`,
      ttl: 300, // 5 minutes cache (increased from 1 minute)
      fetchFn: async () => {
        // Single optimized query: authorization + participants in ONE query
        return db.streamParticipant.findMany({
          where: {
            streamId: params.streamId,
            // Authorization check in the query itself
            stream: {
              OR: [
                { userId: self.id }, // User is owner
                {
                  participants: {
                    some: {
                      userId: self.id,
                      role: { in: ["HOST", "CO_HOST"] },
                      status: "JOINED",
                    },
                  },
                },
              ],
            },
          },
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

    // If no participants returned, user doesn't have access
    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(participants);
  } catch (error) {
    console.error(`[API] /api/backstage/stream/${params.streamId}/participants error:`, error);
    
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
