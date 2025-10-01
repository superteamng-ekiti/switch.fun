import { Skeleton } from "@/components/ui/skeleton";

const HEADER_HEIGHT = '4rem';
const SIDEBAR_WIDTH_COLLAPSED = 120;

export function BackstageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="w-full h-16 px-4 flex items-center justify-between border-b border-b-border/40">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      {/* Main Content Skeleton */}
      <div 
        className="w-full flex gap-0"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        {/* Main Section Skeleton */}
        <div className="w-full h-full flex flex-col justify-between">
          <div className="w-full h-full p-4 flex items-center flex-col gap-4">
            {/* Stream Screen Skeleton */}
            <Skeleton className="w-full aspect-video rounded-lg" />
            
            {/* Layout Selector Skeleton */}
            <div className="w-full flex gap-2">
              <Skeleton className="h-20 w-20 rounded-md" />
              <Skeleton className="h-20 w-20 rounded-md" />
              <Skeleton className="h-20 w-20 rounded-md" />
            </div>
          </div>

          {/* Footer Action Skeleton */}
          <div className="w-full h-[80px] bg-lightDarkCard border-t border-t-border/40 flex items-center justify-center gap-4 px-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>

        {/* Actions Section Skeleton */}
        <div
          className="h-full bg-lightDarkCard flex gap-0 border-l border-border/40"
          style={{ width: `${SIDEBAR_WIDTH_COLLAPSED}px` }}
        >
          <div 
            className="w-full h-full bg-transparent border-l border-border/40 px-2 py-10 flex flex-col gap-4"
          >
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
