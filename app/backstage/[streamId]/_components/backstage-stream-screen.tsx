"use client";

import React from 'react';
import { LiveLayoutPreview } from './live-layout-preview';

export const BackstageStreamScreen = () => {
  return (
    <div className='w-full max-w-[760px] aspect-video'>
      {/* Live Layout Preview with actual video feeds */}
      <LiveLayoutPreview className="w-full h-full" />
    </div>
  )
}
