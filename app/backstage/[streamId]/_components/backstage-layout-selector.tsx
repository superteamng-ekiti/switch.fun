"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useAtom } from "jotai";
import { selectedLayoutAtom, type LayoutType } from "@/store/backstage-atoms";

const layouts = [
  {
    name: "single" as LayoutType,
    image: "/image/browser-stream-layout/single.png",
  },
  {
    name: "double-full" as LayoutType,
    image: "/image/browser-stream-layout/double-full.png",
  },
  {
    name: "double-half" as LayoutType,
    image: "/image/browser-stream-layout/double-half.png",
  },
  {
    name: "grid" as LayoutType,
    image: "/image/browser-stream-layout/grid.png",
  },
  {
    name: "main-screen" as LayoutType,
    image: "/image/browser-stream-layout/main-screen.png",
  },
  {
    name: "multi-screen" as LayoutType,
    image: "/image/browser-stream-layout/multi-screen.png",
  },
  {
    name: "screen-vs" as LayoutType,
    image: "/image/browser-stream-layout/screen-vs.png",
  },
];

export function BackstageLayoutSelector() {
  const [selectedLayout, setSelectedLayout] = useAtom(selectedLayoutAtom);

  return (
    <div className="w-full h-[80px] flex items-center justify-center gap-4 p-4">
      {layouts.map((layout, index) => (
        <div
          key={layout.name}
          className="w-[80px] h-[80px] flex items-center justify-center cursor-pointer"
          onClick={() => setSelectedLayout(layout.name)}
        >
          <Image
            src={layout.image}
            alt={layout.name}
            width={index === 6 ? 117 : 94}
            height={64}
            className={cn(
              "hover:border hover:border-primary transition-colors",
              selectedLayout === layout.name && "border border-primary"
            )}
          />
        </div>
      ))}
    </div>
  );
}
