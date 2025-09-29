"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { AccessToken } from "livekit-server-sdk";

const createBrowserStreamSchema = z.object({
  title: z.string().min(1, "Stream title is required").max(100, "Title too long"),
  subCategoryId: z.string().min(1, "Category is required"),
});

export async function createBrowserStream(data: z.infer<typeof createBrowserStreamSchema>) {
  try {
    const self = await getSelf();
    
    if (!self) {
      throw new Error("Unauthorized");
    }

    const validated = createBrowserStreamSchema.parse(data);

    // Verify subcategory exists
    const subCategory = await db.subCategory.findUnique({
      where: { id: validated.subCategoryId, isActive: true },
      include: { category: true },
    });

    if (!subCategory) {
      throw new Error("Invalid category selected");
    }

    // Check if user already has a stream
    const existingStream = await db.stream.findUnique({
      where: { userId: self.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
        participants: {
          where: { userId: self.id },
          take: 1,
        },
      },
    });

    let stream;
    let accessToken;

    if (existingStream) {
      // If stream is live, redirect to existing backstage
      if (existingStream.isLive) {
        // Generate access token for existing live stream
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;

        if (!apiKey || !apiSecret) {
          console.error("LiveKit credentials not configured");
          throw new Error("Streaming service not configured");
        }

        const token = new AccessToken(apiKey, apiSecret, {
          identity: self.id,
          name: self.username,
        });

        token.addGrant({
          room: existingStream.liveKitRoomName || `browser_${self.id}_${Date.now()}`,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          roomAdmin: true,
        });

        accessToken = token.toJwt();

        return {
          success: true,
          data: {
            stream: {
              id: existingStream.id,
              title: existingStream.title,
              roomName: existingStream.liveKitRoomName,
              isPreLive: existingStream.isPreLive,
              user: existingStream.user,
            },
            accessToken,
          },
        };
      }

      // If stream is not live, update it with new details
      stream = await db.stream.update({
        where: { id: existingStream.id },
        data: {
          name: validated.title,
          title: validated.title,
          streamType: "BROWSER", // Ensure stream type is set to BROWSER
          isPreLive: true, // Reset to backstage mode
          liveKitRoomName: existingStream.liveKitRoomName || `browser_${self.id}_${Date.now()}`,
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

      // Ensure host participant record exists
      const existingParticipant = existingStream.participants[0];
      if (!existingParticipant) {
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
      }
    } else {
      // Generate unique LiveKit room name for new stream
      const roomName = `browser_${self.id}_${Date.now()}`;

      // Create new browser stream
      stream = await db.stream.create({
        data: {
          name: validated.title,
          title: validated.title,
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
    }

    // Generate LiveKit access token for the host (only if not already generated)
    if (!accessToken) {
      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;

      if (!apiKey || !apiSecret) {
        console.error("LiveKit credentials not configured");
        throw new Error("Streaming service not configured");
      }

      const token = new AccessToken(apiKey, apiSecret, {
        identity: self.id,
        name: self.username,
      });

      // Grant host permissions
      token.addGrant({
        room: stream.liveKitRoomName || `browser_${self.id}_${Date.now()}`,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        roomAdmin: true,
      });

      accessToken = token.toJwt();
    }

    // Revalidate relevant paths
    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/backstage/${stream.id}`);

    console.log("[createBrowserStream] Successfully created stream:", {
      streamId: stream.id,
      title: stream.title,
      userId: self.id,
      username: self.username,
      roomName: stream.liveKitRoomName,
    });

    return {
      success: true,
      data: {
        stream: {
          id: stream.id,
          title: stream.title,
          roomName: stream.liveKitRoomName,
          isPreLive: stream.isPreLive,
          user: stream.user,
        },
        accessToken,
      },
    };

  } catch (err: any) {
    console.error("[createBrowserStream] error:", err);
    
    if (err instanceof z.ZodError) {
      throw new Error(err.errors[0]?.message || "Invalid input");
    }
    
    throw new Error(err.message || "Failed to create stream");
  }
}
