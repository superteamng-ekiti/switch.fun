"use server";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { ParticipantRole } from "@prisma/client";

interface CreateInviteParams {
  streamId: string;
  role?: ParticipantRole;
  maxUses?: number;
  expiresAt?: Date;
}

export async function createBackstageInvite({
  streamId,
  role = "SPEAKER",
  maxUses,
  expiresAt,
}: CreateInviteParams) {
  try {
    const self = await getSelf();
    
    // Verify user owns the stream or is a co-host
    const stream = await db.stream.findFirst({
      where: {
        id: streamId,
        OR: [
          { userId: self.id },
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
    });

    if (!stream) {
      throw new Error("Stream not found or you don't have permission to create invites");
    }

    // Generate a unique token
    const token = nanoid(12); // Short, URL-friendly token

    const invite = await db.backstageInvite.create({
      data: {
        streamId,
        token,
        role,
        maxUses,
        expiresAt,
        createdBy: self.id,
      },
    });

    revalidatePath(`/backstage/${streamId}`);
    
    return { 
      success: true, 
      invite: {
        id: invite.id,
        token: invite.token,
        role: invite.role,
        maxUses: invite.maxUses,
        expiresAt: invite.expiresAt,
      }
    };
  } catch (error: any) {
    console.error("[createBackstageInvite] error:", error);
    throw new Error(error.message || "Failed to create invite");
  }
}

export async function getStreamInvites(streamId: string) {
  try {
    const self = await getSelf();
    
    // Verify user owns the stream or is a co-host
    const stream = await db.stream.findFirst({
      where: {
        id: streamId,
        OR: [
          { userId: self.id },
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
    });

    if (!stream) {
      throw new Error("Stream not found or you don't have permission to view invites");
    }

    const invites = await db.backstageInvite.findMany({
      where: {
        streamId,
        isActive: true,
      },
      include: {
        creator: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, invites };
  } catch (error: any) {
    console.error("[getStreamInvites] error:", error);
    throw new Error(error.message || "Failed to get invites");
  }
}

export async function deactivateInvite(inviteId: string) {
  try {
    const self = await getSelf();
    
    // Find the invite and verify permissions
    const invite = await db.backstageInvite.findFirst({
      where: {
        id: inviteId,
      },
      include: {
        stream: true,
      },
    });

    if (!invite) {
      throw new Error("Invite not found");
    }

    // Check if user has permission to deactivate
    const hasPermission = invite.createdBy === self.id || invite.stream.userId === self.id;
    
    if (!hasPermission) {
      // Check if user is a co-host
      const participant = await db.streamParticipant.findFirst({
        where: {
          streamId: invite.streamId,
          userId: self.id,
          role: { in: ["HOST", "CO_HOST"] },
          status: "JOINED",
        },
      });
      
      if (!participant) {
        throw new Error("You don't have permission to deactivate this invite");
      }
    }

    await db.backstageInvite.update({
      where: { id: inviteId },
      data: { isActive: false },
    });

    revalidatePath(`/backstage/${invite.streamId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[deactivateInvite] error:", error);
    throw new Error(error.message || "Failed to deactivate invite");
  }
}

export async function validateInviteToken(token: string) {
  try {
    const invite = await db.backstageInvite.findFirst({
      where: {
        token,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
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

    // Check usage limits
    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      return { success: false, error: "Invite has reached maximum usage limit" };
    }

    return { 
      success: true, 
      invite: {
        id: invite.id,
        streamId: invite.streamId,
        role: invite.role,
        stream: invite.stream,
      }
    };
  } catch (error: any) {
    console.error("[validateInviteToken] error:", error);
    return { success: false, error: "Failed to validate invite" };
  }
}

export async function joinViaInvite(token: string) {
  try {
    const self = await getSelf();
    
    // Validate the invite
    const validation = await validateInviteToken(token);
    if (!validation.success || !validation.invite) {
      throw new Error(validation.error || "Invalid invite");
    }

    const { invite } = validation;

    // Check if user is already a participant
    const existingParticipant = await db.streamParticipant.findFirst({
      where: {
        streamId: invite.streamId,
        userId: self.id,
      },
    });

    if (existingParticipant) {
      // Update existing participant
      await db.streamParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          role: invite.role,
          status: "JOINED",
          joinedAt: new Date(),
          canSpeak: invite.role !== "VIEWER",
          canVideo: invite.role !== "VIEWER",
        },
      });
    } else {
      // Create new participant
      await db.streamParticipant.create({
        data: {
          streamId: invite.streamId,
          userId: self.id,
          role: invite.role,
          status: "JOINED",
          joinedAt: new Date(),
          canSpeak: invite.role !== "VIEWER",
          canVideo: invite.role !== "VIEWER",
        },
      });
    }

    // Increment usage count
    await db.backstageInvite.update({
      where: { id: invite.id },
      data: {
        usedCount: { increment: 1 },
      },
    });

    revalidatePath(`/backstage/${invite.streamId}`);
    
    return { 
      success: true, 
      streamId: invite.streamId,
      role: invite.role,
    };
  } catch (error: any) {
    console.error("[joinViaInvite] error:", error);
    throw new Error(error.message || "Failed to join via invite");
  }
}
