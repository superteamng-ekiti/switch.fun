"use client";

import { Follow, User } from "@prisma/client";

import { useSidebar } from "@/store/use-sidebar";

import { UserItem, UserItemSkeleton } from "./user-item";
import { useFollowedUsers } from "@/hooks/use-followed-users";

// interface FollowingProps {
//   data: (Follow & { 
//     following: User & {
//       stream: { isLive: boolean } | null;
//     },
//   })[];
// }

export const Following = () => {
  const { collapsed } = useSidebar((state) => state);

  const { data, isLoading } = useFollowedUsers();

  if (isLoading) {
    return <FollowingSkeleton />;
  }

  if (!data?.length) {
    return null;
  }

  return (
    <div>
      {!collapsed && (
        <div className="pl-6 mb-4">
          <p className="text-sm text-muted-foreground">
            Following
          </p>
        </div>
      )}
      <ul className="space-y-2 px-2">
        {data?.map((follow) => (
          <UserItem
            key={follow.following.id}
            username={follow.following.username}
            imageUrl={follow.following.imageUrl}
            isLive={follow.following.stream?.isLive}
          />
        ))}
      </ul>
    </div>
  );
};

export const FollowingSkeleton = () => {
  return (
    <ul className="px-2 pt-2 lg:pt-0">
      {[...Array(3)].map((_, i) => (
        <UserItemSkeleton key={i} />
      ))}
    </ul>
  );
};
