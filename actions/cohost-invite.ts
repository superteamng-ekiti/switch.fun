"use server";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { nanoid } from "nanoid";

export async function generateCohostInviteLink(streamId: string) {
  try {
    const self = await getSelf();
    
    // Verify user owns the stream
    const stream = await db.stream.findFirst({
      where: {
        id: streamId,
        userId: self.id,
      },
    });

    if (!stream) {
      throw new Error("Stream not found or you don't have permission");
    }

    // Check if there's already an active invite
    const existingInvite = await db.backstageInvite.findFirst({
      where: {
        streamId,
        isActive: true,
        role: "CO_HOST",
      },
    });

    if (existingInvite) {
      return { 
        success: true, 
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/backstage/join?token=${existingInvite.token}`
      };
    }

    // Create new invite
    const token = nanoid(12);
    
    await db.backstageInvite.create({
      data: {
        streamId,
        token,
        role: "CO_HOST",
        createdBy: self.id,
        // No expiration, no usage limits for simplicity
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/backstage/join?token=${token}`;
    
    return { success: true, inviteUrl };
  } catch (error: any) {
    console.error("[generateCohostInviteLink] error:", error);
    throw new Error(error.message || "Failed to generate invite link");
  }
}

export async function joinAsCohostViaInvite(token: string) {
  try {
    const self = await getSelf();
    
    // Find the invite
    const invite = await db.backstageInvite.findFirst({
      where: {
        token,
        isActive: true,
        role: "CO_HOST",
      },
      include: {
        stream: {
          include: {
            user: {
              select: {
                username: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!invite) {
      return { success: false, error: "Invalid or expired invite" };
    }

    // Check if user is already a participant
    const existingParticipant = await db.streamParticipant.findFirst({
      where: {
        streamId: invite.streamId,
        userId: self.id,
      },
    });

    if (existingParticipant) {
      // Update existing participant to co-host
      await db.streamParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          role: "CO_HOST",
          status: "JOINED",
          joinedAt: new Date(),
          canSpeak: true,
          canVideo: true,
        },
      });
    } else {
      // Create new co-host participant
      await db.streamParticipant.create({
        data: {
          streamId: invite.streamId,
          userId: self.id,
          role: "CO_HOST",
          status: "JOINED",
          joinedAt: new Date(),
          canSpeak: true,
          canVideo: true,
        },
      });
    }

    return { 
      success: true, 
      streamId: invite.streamId,
      stream: invite.stream,
    };
  } catch (error: any) {
    console.error("[joinAsCohostViaInvite] error:", error);
    throw new Error(error.message || "Failed to join as co-host");
  }
}
