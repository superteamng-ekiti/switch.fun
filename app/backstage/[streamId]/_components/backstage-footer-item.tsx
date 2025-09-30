import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'

interface BackstageFooterItemProps {
    icon: string;
    onClick: () => void;
    alt: string;
    className?: string;
    isActive?: boolean;
}

export const BackstageFooterItem = ({icon, onClick, alt, className, isActive = false}: BackstageFooterItemProps) => {
  return (
    <div 
      aria-label="button" 
      role="button" 
      className={cn(
        'h-12 w-12 flex items-center justify-center cursor-pointer rounded-[8px] transition-colors',
        isActive ? 'bg-primary hover:bg-primary/90' : 'bg-lightDarkCardHover hover:bg-lightDarkCardHover/80',
        className
      )} 
      onClick={onClick}
    >
      <Image src={icon} alt={alt} width={24} height={24} />
    </div>
  )
}
