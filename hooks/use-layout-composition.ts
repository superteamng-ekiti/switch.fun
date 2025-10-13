import { useEffect, useCallback } from "react";
import { useAtomValue } from "jotai";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { selectedLayoutAtom } from "@/store/backstage-atoms";
import { 
  generateLayoutComposition, 
  convertLiveKitParticipants,
  type StreamLayoutType 
} from "@/lib/livekit-layouts";

/**
 * Hook to manage layout composition for LiveKit streaming
 * 
 * This hook:
 * 1. Monitors layout changes and participant changes
 * 2. Generates HTML composition for the current layout
 * 3. Provides utilities for layout management
 * 4. Handles LiveKit egress integration (when implemented)
 */
export function useLayoutComposition() {
  const selectedLayout = useAtomValue(selectedLayoutAtom);
  const liveKitParticipants = useParticipants();
  const room = useRoomContext();

  // Convert LiveKit participants to our layout format
  const participants = convertLiveKitParticipants(liveKitParticipants);
  
  // Generate current composition
  const composition = generateLayoutComposition(
    selectedLayout as StreamLayoutType, 
    participants
  );

  // Log layout changes for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[useLayoutComposition] Layout changed:', {
        layout: selectedLayout,
        participantCount: participants.length,
        hasScreenShare: participants.some(p => p.isScreenShare),
      });
    }
  }, [selectedLayout, participants]);

  /**
   * Start egress with current layout composition
   * This will be used when implementing LiveKit egress for recording/streaming
   */
  const startEgress = useCallback(async () => {
    if (!room) {
      console.error('[useLayoutComposition] No room available for egress');
      return null;
    }

    try {
      // TODO: Implement LiveKit egress API call
      // This would send the composition.html and composition.css to LiveKit
      const egressRequest = {
        roomName: room.name,
        layout: {
          html: composition.html,
          css: composition.css,
          width: composition.width,
          height: composition.height,
        },
        // Additional egress configuration
        output: {
          // RTMP, file, or other output configurations
        }
      };

      console.log('[useLayoutComposition] Egress request prepared:', egressRequest);
      
      // For now, just return the composition
      return composition;
    } catch (error) {
      console.error('[useLayoutComposition] Error starting egress:', error);
      return null;
    }
  }, [room, composition]);

  /**
   * Stop current egress
   */
  const stopEgress = useCallback(async () => {
    try {
      // TODO: Implement LiveKit egress stop API call
      console.log('[useLayoutComposition] Stopping egress');
    } catch (error) {
      console.error('[useLayoutComposition] Error stopping egress:', error);
    }
  }, []);

  /**
   * Get layout recommendations based on current participants
   */
  const getLayoutRecommendations = useCallback(() => {
    const videoParticipants = participants.filter(p => !p.isScreenShare);
    const hasScreenShare = participants.some(p => p.isScreenShare);
    const participantCount = videoParticipants.length;

    const recommendations: { layout: StreamLayoutType; reason: string; priority: number }[] = [];

    // Single participant recommendations
    if (participantCount === 1) {
      if (hasScreenShare) {
        recommendations.push({
          layout: "single-screen",
          reason: "Perfect for single presenter with screen share",
          priority: 10
        });
      } else {
        recommendations.push({
          layout: "single",
          reason: "Optimal for single streamer",
          priority: 10
        });
      }
    }

    // Two participant recommendations
    if (participantCount === 2) {
      if (hasScreenShare) {
        recommendations.push({
          layout: "vs-screen",
          reason: "Great for 1v1 with shared content",
          priority: 10
        });
        recommendations.push({
          layout: "multi-screen",
          reason: "Alternative for 2 people with screen share",
          priority: 8
        });
      } else {
        recommendations.push({
          layout: "multi-full",
          reason: "Perfect for 2-person conversation",
          priority: 10
        });
        recommendations.push({
          layout: "multi-half",
          reason: "More intimate 2-person layout",
          priority: 8
        });
      }
    }

    // Multiple participant recommendations
    if (participantCount >= 3) {
      if (hasScreenShare) {
        recommendations.push({
          layout: "multi-screen",
          reason: "Best for group presentation",
          priority: 10
        });
      } else {
        recommendations.push({
          layout: "grid",
          reason: "Equal focus for all participants",
          priority: 10
        });
        recommendations.push({
          layout: "multi-full",
          reason: "Side-by-side group layout",
          priority: 7
        });
      }
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }, [participants]);

  return {
    // Current state
    selectedLayout,
    participants,
    composition,
    
    // Utilities
    startEgress,
    stopEgress,
    getLayoutRecommendations,
    
    // Computed values
    hasParticipants: participants.length > 0,
    hasScreenShare: participants.some(p => p.isScreenShare),
    participantCount: participants.filter(p => !p.isScreenShare).length,
  };
}
