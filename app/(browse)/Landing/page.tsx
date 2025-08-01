import React from "react";
import { StaticHero } from "./_components/StaticHero";
import { VideoHero } from "./_components/VideoHero";

export default function Landing() {
  return (
    <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden rounded-none">
      {/* Server-side static content */}
      <StaticHero />

      {/* Client-side video with fallback */}
      <VideoHero />
    </div>
  );
}
