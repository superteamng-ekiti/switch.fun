import React from 'react'
import { BackstageStreamScreen } from './backstage-stream-screen'
import { BackstageLayoutSelector } from './backstage-layout-selector'
import { BackstageFooterAction } from './backstage-footer-action'
import { BackstageParticipantsList } from './backstage-participants-list'

interface BackstageMainSectionProps {
  streamId: string;
  currentUserId: string;
  userRole: string;
}

export const BackstageMainSection = ({
  streamId,
  currentUserId,
  userRole,
}: BackstageMainSectionProps) => {
  return (
    <div className='w-full h-full flex flex-col justify-between'>
        <div className='w-full h-full p-4 flex items-center flex-col gap-4'>
            <BackstageStreamScreen />
            <BackstageLayoutSelector />
            
            {/* Participants list */}
            {/* <BackstageParticipantsList 
              streamId={streamId}
              currentUserId={currentUserId}
              userRole={userRole}
            /> */}
        </div>

        <div className='w-full h-[80px] bg-lightDarkCard border-t border-t-border/40'>
            <BackstageFooterAction />
        </div>
    </div>
  )
}
