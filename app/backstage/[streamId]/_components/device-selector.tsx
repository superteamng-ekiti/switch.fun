"use client";

import { useAtom, useAtomValue } from "jotai";
import {
  mediaStateAtom,
  micDevicesAtom,
  cameraDevicesAtom,
  speakerDevicesAtom,
  setMicDeviceAtom,
  setCameraDeviceAtom,
  setSpeakerDeviceAtom,
  type MediaDevice,
} from "@/store/backstage-atoms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceSelectorProps {
  type: "microphone" | "camera" | "speaker";
  children: React.ReactNode;
}

export function DeviceSelector({ type, children }: DeviceSelectorProps) {
  const mediaState = useAtomValue(mediaStateAtom);
  const micDevices = useAtomValue(micDevicesAtom);
  const cameraDevices = useAtomValue(cameraDevicesAtom);
  const speakerDevices = useAtomValue(speakerDevicesAtom);
  
  const [, setMicDevice] = useAtom(setMicDeviceAtom);
  const [, setCameraDevice] = useAtom(setCameraDeviceAtom);
  const [, setSpeakerDevice] = useAtom(setSpeakerDeviceAtom);

  const getDevices = (): MediaDevice[] => {
    switch (type) {
      case "microphone":
        return micDevices;
      case "camera":
        return cameraDevices;
      case "speaker":
        return speakerDevices;
    }
  };

  const getSelectedDevice = (): string | null => {
    switch (type) {
      case "microphone":
        return mediaState.selectedMicDevice;
      case "camera":
        return mediaState.selectedCameraDevice;
      case "speaker":
        return mediaState.selectedSpeakerDevice;
    }
  };

  const handleDeviceSelect = (deviceId: string) => {
    switch (type) {
      case "microphone":
        setMicDevice(deviceId);
        break;
      case "camera":
        setCameraDevice(deviceId);
        break;
      case "speaker":
        setSpeakerDevice(deviceId);
        break;
    }
  };

  const devices = getDevices();
  const selectedDevice = getSelectedDevice();
  const label = type.charAt(0).toUpperCase() + type.slice(1);

  if (devices.length === 0) {
    return <>{children}</>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{label} Devices</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {devices.map((device) => (
          <DropdownMenuItem
            key={device.deviceId}
            onClick={() => handleDeviceSelect(device.deviceId)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">{device.label}</span>
            {selectedDevice === device.deviceId && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {devices.length === 0 && (
          <DropdownMenuItem disabled>
            No {type} devices found
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
