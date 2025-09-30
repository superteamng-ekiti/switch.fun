import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

export const BackstageHeader = () => {
  return (
    <div className='w-full h-16 px-4 flex items-center justify-between border-b border-b-border/40'>
        <div className='flex items-center gap-2'>
            <Image src="/image/switched-logo.svg" alt="Switched Logo" width={24} height={24} />
            <p className='text-sm font-regular'>Backstage</p>
        </div>

        <Button>Start Live</Button>
    </div>
  )
}
