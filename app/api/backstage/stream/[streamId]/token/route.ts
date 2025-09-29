import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const self = await getSelf();
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { streamId } = params;

    // Get stream and verify access
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: {
          where: { userId: self.id },
          select: {
            role: true,
            status: true,
          },
        },
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    // Check if user has access to backstage
    const isOwner = stream.user.id === self.id;
    const participant = stream.participants[0];
    const isAuthorized = isOwner || (participant && 
      (participant.role === "HOST" || participant.role === "CO_HOST") &&
      participant.status === "JOINED"
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Generate LiveKit access token
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("LiveKit credentials not configured");
      return NextResponse.json(
        { error: "Streaming service not configured" },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: self.id,
      name: self.username,
    });

    // Grant appropriate permissions based on role
    const roomName = stream.liveKitRoomName || `browser_${stream.user.id}_${Date.now()}`;
    
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isOwner, // Only stream owner gets admin rights
    });

    const accessToken = token.toJwt();

    return NextResponse.json({
      token: accessToken,
      roomName,
      serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
    });

  } catch (error) {
    console.error("[GET /api/backstage/stream/[streamId]/token] error:", error);
    return NextResponse.json(
      { error: "Failed to generate access token" },
      { status: 500 }
    );
  }
}
