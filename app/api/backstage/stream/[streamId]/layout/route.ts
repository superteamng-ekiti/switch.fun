import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { 
  generateLayoutComposition, 
  type StreamLayoutType, 
  type LayoutParticipant 
} from "@/lib/livekit-layouts";

interface LayoutRequest {
  layoutType: StreamLayoutType;
  participants: LayoutParticipant[];
  action: "preview" | "start_egress" | "stop_egress";
}

/**
 * POST /api/backstage/stream/[streamId]/layout
 * 
 * Handle layout composition requests for backstage
 * - Generate layout previews
 * - Start/stop LiveKit egress with custom layouts
 * - Validate user permissions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const self = await getSelf();
    if (!self?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { streamId } = params;
    if (!streamId) {
      return NextResponse.json({ error: "Stream ID required" }, { status: 400 });
    }

    // Verify user has access to this stream
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      include: {
        user: true,
        participants: {
          include: { user: true }
        }
      }
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Check if user is the stream owner or a participant
    const isOwner = stream.user.id === self.id;
    const isParticipant = stream.participants.some(p => p.user.id === self.id);

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body: LayoutRequest = await request.json();
    const { layoutType, participants, action } = body;

    if (!layoutType || !participants || !action) {
      return NextResponse.json({ 
        error: "Missing required fields: layoutType, participants, action" 
      }, { status: 400 });
    }

    // Generate layout composition
    const composition = generateLayoutComposition(layoutType, participants);

    switch (action) {
      case "preview":
        return NextResponse.json({
          success: true,
          composition,
          layoutType,
          participantCount: participants.length,
        });

      case "start_egress":
        // TODO: Implement LiveKit egress start
        // This would integrate with LiveKit's egress API
        console.log("[Layout API] Starting egress for stream:", streamId, {
          layout: layoutType,
          participants: participants.length,
        });

        // For now, return the composition that would be sent to LiveKit
        return NextResponse.json({
          success: true,
          message: "Egress started (mock)",
          composition,
          egressId: `egress_${streamId}_${Date.now()}`, // Mock egress ID
        });

      case "stop_egress":
        // TODO: Implement LiveKit egress stop
        console.log("[Layout API] Stopping egress for stream:", streamId);

        return NextResponse.json({
          success: true,
          message: "Egress stopped (mock)",
        });

      default:
        return NextResponse.json({ 
          error: "Invalid action. Must be 'preview', 'start_egress', or 'stop_egress'" 
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Layout API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/backstage/stream/[streamId]/layout
 * 
 * Get current layout configuration for a stream
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const self = await getSelf();
    if (!self?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { streamId } = params;
    if (!streamId) {
      return NextResponse.json({ error: "Stream ID required" }, { status: 400 });
    }

    // Verify user has access to this stream
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      include: {
        user: true,
        participants: {
          include: { user: true }
        }
      }
    });

    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Check if user is the stream owner or a participant
    const isOwner = stream.user.id === self.id;
    const isParticipant = stream.participants.some(p => p.user.id === self.id);

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Return available layouts and current configuration
    const availableLayouts = [
      { type: "single", name: "Single Streamer", description: "Single streamer with camera" },
      { type: "multi-full", name: "Multi Full Screen", description: "Multi streamer full screen side-by-side" },
      { type: "multi-half", name: "Multi Half Screen", description: "Multi streamer half screen side-by-side" },
      { type: "grid", name: "Grid View", description: "Multi streamer grid layout" },
      { type: "single-screen", name: "Single + Screen", description: "Single streamer with screen share" },
      { type: "multi-screen", name: "Multi + Screen", description: "Multi streamer with screen share" },
      { type: "vs-screen", name: "VS Layout", description: "2 streamers with shared screen" },
    ];

    return NextResponse.json({
      success: true,
      streamId,
      availableLayouts,
      currentParticipants: stream.participants.map(p => ({
        id: p.id,
        userId: p.user.id,
        username: p.user.username,
        role: p.role,
        status: p.status,
      })),
    });

  } catch (error: any) {
    console.error("[Layout API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
