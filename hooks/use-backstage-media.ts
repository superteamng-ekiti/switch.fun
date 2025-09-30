import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  setAvailableDevicesAtom,
  initializeMediaStateAtom,
  type MediaDevice,
} from "@/store/backstage-atoms";

/**
 * Hook to initialize and manage backstage media devices
 * Handles device enumeration and state initialization
 */
export function useBackstageMedia() {
  const setAvailableDevices = useSetAtom(setAvailableDevicesAtom);
  const initializeMediaState = useSetAtom(initializeMediaStateAtom);

  useEffect(() => {
    // Initialize media state from localStorage
    initializeMediaState();

    // Enumerate media devices
    const enumerateDevices = async () => {
      try {
        // Request permissions first to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const mediaDevices: MediaDevice[] = devices.map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `${device.kind} ${device.deviceId.slice(0, 5)}`,
          kind: device.kind as "audioinput" | "videoinput" | "audiooutput",
        }));

        setAvailableDevices(mediaDevices);
      } catch (error) {
        console.error("Error enumerating media devices:", error);
      }
    };

    enumerateDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [setAvailableDevices, initializeMediaState]);
}
