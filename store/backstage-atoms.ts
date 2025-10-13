import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * Backstage State Management
 * 
 * This file contains all Jotai atoms for managing backstage state.
 * Following the established patterns from chat-atoms.ts for consistency.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type LayoutType =
  | "single"           // 1. Single streamer with camera
  | "multi-full"       // 2. Multi streamer full screen side-by-side  
  | "multi-half"       // 3. Multi streamer half screen side-by-side
  | "grid"             // 4. Multi streamer grid view
  | "single-screen"    // 5. Single streamer with screen share
  | "multi-screen"     // 6. Multi streamer with screen share
  | "vs-screen";       // 7. VS layout with 2 streamers + shared screen

export type SidebarMenuType = "chat" | "media" | "participants" | "tips" | null;

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: "audioinput" | "videoinput" | "audiooutput";
}

export interface BackstageMediaState {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isScreenSharing: boolean;
  selectedMicDevice: string | null;
  selectedCameraDevice: string | null;
  selectedSpeakerDevice: string | null;
  availableDevices: MediaDevice[];
}

export interface BackstageUIState {
  selectedLayout: LayoutType;
  selectedSidebarMenu: SidebarMenuType;
  isSidebarExpanded: boolean;
  isFullscreen: boolean;
}

// ============================================================================
// MEDIA STATE ATOMS
// ============================================================================

/**
 * Base media state atom
 * Manages microphone, camera, and screen sharing states
 * Default: All media disabled for privacy and security
 */
const baseMediaStateAtom = atom<BackstageMediaState>({
  isMicEnabled: false,
  isCameraEnabled: false,
  isScreenSharing: false,
  selectedMicDevice: null,
  selectedCameraDevice: null,
  selectedSpeakerDevice: null,
  availableDevices: [],
});

/**
 * Persistent media state with localStorage sync
 * Persists device selections across sessions
 */
export const mediaStateAtom = atom(
  (get) => get(baseMediaStateAtom),
  (get, set, newValue: BackstageMediaState) => {
    set(baseMediaStateAtom, newValue);

    // Persist only device selections (not enabled states)
    if (typeof window !== "undefined") {
      try {
        const persistData = {
          selectedMicDevice: newValue.selectedMicDevice,
          selectedCameraDevice: newValue.selectedCameraDevice,
          selectedSpeakerDevice: newValue.selectedSpeakerDevice,
        };
        localStorage.setItem(
          "switch-fun-backstage-devices",
          JSON.stringify(persistData)
        );
      } catch (error) {
        console.error("Error saving device preferences:", error);
      }
    }
  }
);

/**
 * Initialize media state from localStorage
 */
export const initializeMediaStateAtom = atom(null, (get, set) => {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem("switch-fun-backstage-devices");
      if (item) {
        const parsed = JSON.parse(item);
        const currentState = get(baseMediaStateAtom);
        set(baseMediaStateAtom, {
          ...currentState,
          selectedMicDevice: parsed.selectedMicDevice || null,
          selectedCameraDevice: parsed.selectedCameraDevice || null,
          selectedSpeakerDevice: parsed.selectedSpeakerDevice || null,
        });
      }
    } catch (error) {
      console.error("Error loading device preferences:", error);
    }
  }
});

// ============================================================================
// MEDIA CONTROL ATOMS (Derived)
// ============================================================================

/**
 * Toggle microphone state
 */
export const toggleMicAtom = atom(null, (get, set) => {
  const currentState = get(mediaStateAtom);
  const newState = !currentState.isMicEnabled;
  set(mediaStateAtom, {
    ...currentState,
    isMicEnabled: newState,
  });
});

/**
 * Toggle camera state
 */
export const toggleCameraAtom = atom(null, (get, set) => {
  const currentState = get(mediaStateAtom);
  const newState = !currentState.isCameraEnabled;
  set(mediaStateAtom, {
    ...currentState,
    isCameraEnabled: newState,
  });
});

/**
 * Toggle screen sharing state
 */
export const toggleScreenShareAtom = atom(null, (get, set) => {
  const currentState = get(mediaStateAtom);
  set(mediaStateAtom, {
    ...currentState,
    isScreenSharing: !currentState.isScreenSharing,
  });
});

/**
 * Update selected microphone device
 */
export const setMicDeviceAtom = atom(null, (get, set, deviceId: string) => {
  const currentState = get(mediaStateAtom);
  set(mediaStateAtom, {
    ...currentState,
    selectedMicDevice: deviceId,
  });
});

/**
 * Update selected camera device
 */
export const setCameraDeviceAtom = atom(null, (get, set, deviceId: string) => {
  const currentState = get(mediaStateAtom);
  set(mediaStateAtom, {
    ...currentState,
    selectedCameraDevice: deviceId,
  });
});

/**
 * Update selected speaker device
 */
export const setSpeakerDeviceAtom = atom(null, (get, set, deviceId: string) => {
  const currentState = get(mediaStateAtom);
  set(mediaStateAtom, {
    ...currentState,
    selectedSpeakerDevice: deviceId,
  });
});

/**
 * Update available media devices
 */
export const setAvailableDevicesAtom = atom(
  null,
  (get, set, devices: MediaDevice[]) => {
    const currentState = get(mediaStateAtom);
    set(mediaStateAtom, {
      ...currentState,
      availableDevices: devices,
    });
  }
);

// ============================================================================
// UI STATE ATOMS
// ============================================================================

/**
 * Layout selection atom with localStorage persistence
 */
export const selectedLayoutAtom = atomWithStorage<LayoutType>(
  "switch-fun-backstage-layout",
  "single"
);

/**
 * Sidebar menu selection atom (no persistence needed)
 */
export const selectedSidebarMenuAtom = atom<SidebarMenuType>(null);

/**
 * Sidebar expansion state (derived from menu selection)
 */
export const isSidebarExpandedAtom = atom((get) => {
  const selectedMenu = get(selectedSidebarMenuAtom);
  return selectedMenu !== null;
});

/**
 * Fullscreen state atom (no persistence needed)
 */
export const isFullscreenAtom = atom<boolean>(false);

// ============================================================================
// UI CONTROL ATOMS (Derived)
// ============================================================================

/**
 * Set layout type
 */
export const setLayoutAtom = atom(null, (get, set, layout: LayoutType) => {
  set(selectedLayoutAtom, layout);
});

/**
 * Set sidebar menu
 */
export const setSidebarMenuAtom = atom(
  null,
  (get, set, menu: SidebarMenuType) => {
    set(selectedSidebarMenuAtom, menu);
  }
);

/**
 * Toggle sidebar menu (close if same menu clicked, open if different)
 */
export const toggleSidebarMenuAtom = atom(
  null,
  (get, set, menu: SidebarMenuType) => {
    const currentMenu = get(selectedSidebarMenuAtom);
    if (currentMenu === menu) {
      set(selectedSidebarMenuAtom, null);
    } else {
      set(selectedSidebarMenuAtom, menu);
    }
  }
);

/**
 * Close sidebar
 */
export const closeSidebarAtom = atom(null, (get, set) => {
  set(selectedSidebarMenuAtom, null);
});

/**
 * Toggle fullscreen
 */
export const toggleFullscreenAtom = atom(null, (get, set) => {
  const currentState = get(isFullscreenAtom);
  set(isFullscreenAtom, !currentState);
});

// ============================================================================
// COMPUTED/DERIVED ATOMS
// ============================================================================

/**
 * Get microphone devices
 */
export const micDevicesAtom = atom((get) => {
  const state = get(mediaStateAtom);
  return state.availableDevices.filter((d) => d.kind === "audioinput");
});

/**
 * Get camera devices
 */
export const cameraDevicesAtom = atom((get) => {
  const state = get(mediaStateAtom);
  return state.availableDevices.filter((d) => d.kind === "videoinput");
});

/**
 * Get speaker devices
 */
export const speakerDevicesAtom = atom((get) => {
  const state = get(mediaStateAtom);
  return state.availableDevices.filter((d) => d.kind === "audiooutput");
});

/**
 * Check if any media is active
 */
export const hasActiveMediaAtom = atom((get) => {
  const state = get(mediaStateAtom);
  return (
    state.isMicEnabled || state.isCameraEnabled || state.isScreenSharing
  );
});

/**
 * Get current media status summary
 */
export const mediaStatusAtom = atom((get) => {
  const state = get(mediaStateAtom);
  return {
    mic: state.isMicEnabled ? "enabled" : "disabled",
    camera: state.isCameraEnabled ? "enabled" : "disabled",
    screen: state.isScreenSharing ? "sharing" : "not-sharing",
  };
});
