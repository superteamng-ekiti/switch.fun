import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { AccessToken } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const self = await getSelf();
    
    if (!self) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, subCategoryId } = body;

    // Validate input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Stream title is required" },
        { status: 400 }
      );
    }

    if (!subCategoryId || typeof subCategoryId !== "string") {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    // Verify subcategory exists
    const subCategory = await db.subCategory.findUnique({
      where: { id: subCategoryId, isActive: true },
      include: { category: true },
    });

    if (!subCategory) {
      return NextResponse.json(
        { success: false, error: "Invalid category selected" },
        { status: 400 }
      );
    }

    // Check if user already has a stream
    const existingStream = await db.stream.findUnique({
      where: { userId: self.id },
    });

    if (existingStream) {
      return NextResponse.json(
        { success: false, error: "You already have an active stream" },
        { status: 400 }
      );
    }

    // Generate unique LiveKit room name
    const roomName = `browser_${self.id}_${Date.now()}`;

    // Create the browser stream
    const stream = await db.stream.create({
      data: {
        name: title.trim(),
        title: title.trim(),
        userId: self.id,
        streamType: "BROWSER",
        isPreLive: true, // Start in backstage mode
        liveKitRoomName: roomName,
        // Browser streams don't need ingress/server/streamKey
        ingressId: null,
        serverUrl: null,
        streamKey: null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
    });

    // Create the host participant record
    await db.streamParticipant.create({
      data: {
        streamId: stream.id,
        userId: self.id,
        role: "HOST",
        status: "JOINED",
        joinedAt: new Date(),
        canSpeak: true,
        canVideo: true,
      },
    });

    // Generate LiveKit access token for the host
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("LiveKit credentials not configured");
      return NextResponse.json(
        { success: false, error: "Streaming service not configured" },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: self.id,
      name: self.username,
    });

    // Grant host permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: true,
    });

    const accessToken = token.toJwt();

    return NextResponse.json({
      success: true,
      stream: {
        id: stream.id,
        title: stream.title,
        roomName: stream.liveKitRoomName,
        isPreLive: stream.isPreLive,
        user: stream.user,
      },
      accessToken,
    });

  } catch (error) {
    console.error("[POST /api/browser-stream/create] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
