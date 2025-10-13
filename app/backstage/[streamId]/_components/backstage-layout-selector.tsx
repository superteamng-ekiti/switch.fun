"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAtom } from "jotai";
import { selectedLayoutAtom, type LayoutType } from "@/store/backstage-atoms";

const layouts = [
  {
    name: "single" as LayoutType,
    image: "/image/browser-stream-layout/single.png",
    title: "Single Streamer",
    description: "Single streamer with camera"
  },
  {
    name: "multi-full" as LayoutType,
    image: "/image/browser-stream-layout/double-full.png",
    title: "Multi Full Screen",
    description: "Multi streamer full screen side-by-side"
  },
  {
    name: "multi-half" as LayoutType,
    image: "/image/browser-stream-layout/double-half.png",
    title: "Multi Half Screen",
    description: "Multi streamer half screen side-by-side"
  },
  {
    name: "grid" as LayoutType,
    image: "/image/browser-stream-layout/grid.png",
    title: "Grid View",
    description: "Multi streamer grid layout"
  },
  {
    name: "single-screen" as LayoutType,
    image: "/image/browser-stream-layout/main-screen.png",
    title: "Single + Screen",
    description: "Single streamer with screen share"
  },
  {
    name: "multi-screen" as LayoutType,
    image: "/image/browser-stream-layout/multi-screen.png",
    title: "Multi + Screen",
    description: "Multi streamer with screen share"
  },
  {
    name: "vs-screen" as LayoutType,
    image: "/image/browser-stream-layout/screen-vs.png",
    title: "VS Layout",
    description: "2 streamers with shared screen"
  },
];

export function BackstageLayoutSelector() {
  const [selectedLayout, setSelectedLayout] = useAtom(selectedLayoutAtom);

  return (
    <div className="w-full h-[80px] flex items-center justify-center gap-4 p-4">
      {layouts.map((layout, index) => (
        <div
          key={layout.name}
          className="w-[80px] h-[80px] flex items-center justify-center cursor-pointer group relative"
          onClick={() => setSelectedLayout(layout.name)}
          title={`${layout.title}: ${layout.description}`}
        >
          <Image
            src={layout.image}
            alt={layout.name}
            width={index === 6 ? 117 : 94}
            height={64}
            className={cn(
              "hover:border hover:border-primary transition-all duration-200 rounded-[4px] hover:scale-105",
              selectedLayout === layout.name && "border border-primary scale-105"
            )}
          />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            <div className="font-medium">{layout.title}</div>
            <div className="text-white/70">{layout.description}</div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
