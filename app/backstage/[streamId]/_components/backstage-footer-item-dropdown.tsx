"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { DeviceSelector } from "./device-selector";

interface BackstageFooterItemDropdownProps {
  icon: string;
  onToggle: () => void;
  alt: string;
  className?: string;
  isActive?: boolean;
  deviceType?: "microphone" | "camera" | "speaker";
}

export function BackstageFooterItemDropdown({
  icon,
  onToggle,
  alt,
  className,
  isActive = false,
  deviceType,
}: BackstageFooterItemDropdownProps) {
  const handleMainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <div className="flex gap-0 rounded-[8px] overflow-hidden">
      {/* Main toggle button */}
      <button
        onClick={handleMainClick}
        aria-label={`Toggle ${alt}`}
        className={cn(
          "h-12 w-10 flex items-center justify-center cursor-pointer transition-colors",
          isActive
            ? "bg-primary hover:bg-primary/90"
            : "bg-lightDarkCardHover hover:bg-lightDarkCardHover/80",
          className
        )}
      >
        <Image src={icon} alt={alt} width={24} height={24} />
      </button>

      {/* Device selector dropdown */}
      {deviceType && (
        <DeviceSelector type={deviceType}>
          <button
            aria-label={`Select ${alt} device`}
            className={cn(
              "h-12 w-5 flex items-center justify-center cursor-pointer transition-colors hover:bg-opacity-80",
              isActive ? "bg-primary/80" : "bg-darkCard"
            )}
          >
            <ChevronDown className="w-3 h-3 stroke-gray-300" />
          </button>
        </DeviceSelector>
      )}
    </div>
  );
}
