import React from 'react'
import { BackstageStreamScreen } from './backstage-stream-screen'
import { BackstageLayoutSelector } from './backstage-layout-selector'

export const BackstageMainSection = () => {
  return (
    <div className='w-full h-full flex flex-col justify-between'>
        <div className='w-full h-full p-4 flex items-center flex-col'>
            <BackstageStreamScreen />
            <BackstageLayoutSelector />
        </div>

        <div className='w-full h-[80px] bg-lightDarkCard border-t border-t-border/40'>
            
        </div>
    </div>
  )
}
