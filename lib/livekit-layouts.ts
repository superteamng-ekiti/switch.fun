/**
 * LiveKit Layout Composition System
 * 
 * This module provides HTML composition templates for LiveKit streaming layouts.
 * Each layout corresponds to the 7 designs provided and generates the appropriate
 * HTML structure for LiveKit's composition API.
 */

export type StreamLayoutType = 
  | "single"           // 1. Single streamer with camera
  | "multi-full"       // 2. Multi streamer full screen side-by-side  
  | "multi-half"       // 3. Multi streamer half screen side-by-side
  | "grid"             // 4. Multi streamer grid view
  | "single-screen"    // 5. Single streamer with screen share
  | "multi-screen"     // 6. Multi streamer with screen share
  | "vs-screen";       // 7. VS layout with 2 streamers + shared screen

export interface LayoutParticipant {
  identity: string;
  name: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isScreenShare?: boolean;
}

export interface LayoutComposition {
  html: string;
  css: string;
  width: number;
  height: number;
}

/**
 * Base CSS styles used across all layouts
 */
const BASE_CSS = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #0a0a0a;
    color: white;
    overflow: hidden;
  }
  
  .participant {
    position: relative;
    background: #1a1a1a;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid #333;
  }
  
  .participant.speaking {
    border-color: #00ff88;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
  }
  
  .participant-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .participant-info {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: rgba(0, 0, 0, 0.7);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .screen-share {
    background: #000;
    border: none;
    border-radius: 8px;
  }
  
  .screen-share video {
    object-fit: contain;
  }
  
  .muted-indicator {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 0, 0, 0.8);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .vs-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 18px;
    z-index: 10;
  }
`;

/**
 * Generate HTML composition for single streamer layout
 */
export function generateSingleLayout(participants: LayoutParticipant[]): LayoutComposition {
  const participant = participants[0];
  if (!participant) {
    return generateEmptyLayout();
  }

  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: flex; align-items: center; justify-content: center; padding: 40px;">
      <div class="participant ${participant.hasAudio ? 'speaking' : ''}" style="width: 100%; height: 100%; max-width: 1200px;">
        <video class="participant-video" data-lk-participant-identity="${participant.identity}"></video>
        <div class="participant-info">${participant.name}</div>
        ${!participant.hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
      </div>
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Generate HTML composition for multi streamer full screen layout
 */
export function generateMultiFullLayout(participants: LayoutParticipant[]): LayoutComposition {
  const videoParticipants = participants.filter(p => !p.isScreenShare);
  
  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: flex; gap: 20px; padding: 40px;">
      ${videoParticipants.map(participant => `
        <div class="participant ${participant.hasAudio ? 'speaking' : ''}" style="flex: 1; height: 100%;">
          <video class="participant-video" data-lk-participant-identity="${participant.identity}"></video>
          <div class="participant-info">${participant.name}</div>
          ${!participant.hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
        </div>
      `).join('')}
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Generate HTML composition for multi streamer half screen layout
 */
export function generateMultiHalfLayout(participants: LayoutParticipant[]): LayoutComposition {
  const videoParticipants = participants.filter(p => !p.isScreenShare);
  
  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: flex; align-items: center; justify-content: center; padding: 40px;">
      <div style="display: flex; gap: 20px; width: 60%; height: 70%;">
        ${videoParticipants.map(participant => `
          <div class="participant ${participant.hasAudio ? 'speaking' : ''}" style="flex: 1; height: 100%;">
            <video class="participant-video" data-lk-participant-identity="${participant.identity}"></video>
            <div class="participant-info">${participant.name}</div>
            ${!participant.hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Generate HTML composition for grid layout
 */
export function generateGridLayout(participants: LayoutParticipant[]): LayoutComposition {
  const videoParticipants = participants.filter(p => !p.isScreenShare);
  const participantCount = videoParticipants.length;
  
  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(participantCount));
  const rows = Math.ceil(participantCount / cols);
  
  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: grid; grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr); gap: 20px; padding: 40px;">
      ${videoParticipants.map(participant => `
        <div class="participant ${participant.hasAudio ? 'speaking' : ''}" style="width: 100%; height: 100%;">
          <video class="participant-video" data-lk-participant-identity="${participant.identity}"></video>
          <div class="participant-info">${participant.name}</div>
          ${!participant.hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
        </div>
      `).join('')}
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Generate HTML composition for single streamer with screen share
 */
export function generateSingleScreenLayout(participants: LayoutParticipant[]): LayoutComposition {
  const videoParticipant = participants.find(p => !p.isScreenShare);
  const screenParticipant = participants.find(p => p.isScreenShare);
  
  if (!screenParticipant) {
    return generateSingleLayout(participants);
  }

  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: flex; gap: 20px; padding: 20px;">
      <!-- Screen share takes main area -->
      <div class="participant screen-share" style="flex: 1; height: 100%;">
        <video class="participant-video" data-lk-participant-identity="${screenParticipant.identity}"></video>
      </div>
      
      <!-- Video participant in sidebar -->
      ${videoParticipant ? `
        <div class="participant ${videoParticipant.hasAudio ? 'speaking' : ''}" style="width: 320px; height: 240px; margin-top: 20px;">
          <video class="participant-video" data-lk-participant-identity="${videoParticipant.identity}"></video>
          <div class="participant-info">${videoParticipant.name}</div>
          ${!videoParticipant.hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
        </div>
      ` : ''}
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Generate HTML composition for multi streamer with screen share
 */
export function generateMultiScreenLayout(participants: LayoutParticipant[]): LayoutComposition {
  const videoParticipants = participants.filter(p => !p.isScreenShare);
  const screenParticipant = participants.find(p => p.isScreenShare);
  
  if (!screenParticipant) {
    return generateMultiFullLayout(participants);
  }

  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: flex; flex-direction: column; gap: 20px; padding: 20px;">
      <!-- Screen share takes top area -->
      <div class="participant screen-share" style="width: 100%; height: 70%;">
        <video class="participant-video" data-lk-participant-identity="${screenParticipant.identity}"></video>
      </div>
      
      <!-- Video participants in bottom row -->
      <div style="display: flex; gap: 20px; height: 30%;">
        ${videoParticipants.map(participant => `
          <div class="participant ${participant.hasAudio ? 'speaking' : ''}" style="flex: 1; height: 100%;">
            <video class="participant-video" data-lk-participant-identity="${participant.identity}"></video>
            <div class="participant-info">${participant.name}</div>
            ${!participant.hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Generate HTML composition for VS layout (2 streamers + screen share)
 */
export function generateVsScreenLayout(participants: LayoutParticipant[]): LayoutComposition {
  const videoParticipants = participants.filter(p => !p.isScreenShare).slice(0, 2); // Only 2 for VS
  const screenParticipant = participants.find(p => p.isScreenShare);
  
  if (!screenParticipant || videoParticipants.length < 2) {
    return generateMultiScreenLayout(participants);
  }

  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: flex; gap: 20px; padding: 20px;">
      <!-- Left participant -->
      <div class="participant ${videoParticipants[0].hasAudio ? 'speaking' : ''}" style="width: 300px; height: 100%;">
        <video class="participant-video" data-lk-participant-identity="${videoParticipants[0].identity}"></video>
        <div class="participant-info">${videoParticipants[0].name}</div>
        ${!videoParticipants[0].hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
      </div>
      
      <!-- Center screen share with VS badge -->
      <div class="participant screen-share" style="flex: 1; height: 100%; position: relative;">
        <video class="participant-video" data-lk-participant-identity="${screenParticipant.identity}"></video>
        <div class="vs-badge">VS</div>
      </div>
      
      <!-- Right participant -->
      <div class="participant ${videoParticipants[1].hasAudio ? 'speaking' : ''}" style="width: 300px; height: 100%;">
        <video class="participant-video" data-lk-participant-identity="${videoParticipants[1].identity}"></video>
        <div class="participant-info">${videoParticipants[1].name}</div>
        ${!videoParticipants[1].hasAudio ? '<div class="muted-indicator">🔇</div>' : ''}
      </div>
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Generate empty layout for when no participants are available
 */
function generateEmptyLayout(): LayoutComposition {
  const html = `
    <div class="container" style="width: 1920px; height: 1080px; display: flex; align-items: center; justify-content: center; background: #0a0a0a;">
      <div style="text-align: center; color: #666;">
        <h2 style="font-size: 48px; margin-bottom: 20px;">Waiting for participants...</h2>
        <p style="font-size: 24px;">Stream will begin when participants join</p>
      </div>
    </div>
  `;

  return {
    html,
    css: BASE_CSS,
    width: 1920,
    height: 1080
  };
}

/**
 * Main function to generate layout composition based on type and participants
 */
export function generateLayoutComposition(
  layoutType: StreamLayoutType,
  participants: LayoutParticipant[]
): LayoutComposition {
  if (participants.length === 0) {
    return generateEmptyLayout();
  }

  switch (layoutType) {
    case "single":
      return generateSingleLayout(participants);
    case "multi-full":
      return generateMultiFullLayout(participants);
    case "multi-half":
      return generateMultiHalfLayout(participants);
    case "grid":
      return generateGridLayout(participants);
    case "single-screen":
      return generateSingleScreenLayout(participants);
    case "multi-screen":
      return generateMultiScreenLayout(participants);
    case "vs-screen":
      return generateVsScreenLayout(participants);
    default:
      return generateSingleLayout(participants);
  }
}

/**
 * Helper function to convert LiveKit participants to layout participants
 */
export function convertLiveKitParticipants(liveKitParticipants: any[]): LayoutParticipant[] {
  return liveKitParticipants.map(participant => ({
    identity: participant.identity,
    name: participant.name || participant.identity,
    hasVideo: participant.isCameraEnabled || false,
    hasAudio: participant.isMicrophoneEnabled || false,
    isScreenShare: participant.source === 'screen_share' || false,
  }));
}
