# Real-time Participant Management Strategy

## 🎯 Current State Analysis

### **Current Participant Model:**
```typescript
model StreamParticipant {
  id          String            @id @default(uuid())
  streamId    String
  userId      String
  role        ParticipantRole   @default(VIEWER)
  status      ParticipantStatus @default(INVITED)
  joinedAt    DateTime?
  leftAt      DateTime?
  canSpeak    Boolean           @default(false)
  canVideo    Boolean           @default(false)
  // Static database records
}
```

### **Current Issues:**
- ❌ No real-time updates
- ❌ Database polling (expensive)
- ❌ Stale participant status
- ❌ No live presence detection
- ❌ Manual status management

## 🚀 Proposed Real-time Solution

### **Phase 1: LiveKit Integration (Immediate)**
Use LiveKit's built-in participant management for real-time updates.

### **Phase 2: Hybrid Database + LiveKit (Short-term)**
Combine database persistence with LiveKit real-time events.

### **Phase 3: WebSocket Enhancement (Long-term)**
Add custom WebSocket layer for advanced features.

## 📋 Implementation Strategy

### **Phase 1: LiveKit Real-time Participants**

#### **1. LiveKit Participant Hook**
```typescript
// hooks/use-livekit-participants.ts
import { useParticipants, useRoomContext } from "@livekit/components-react";

export function useLiveKitParticipants() {
  const room = useRoomContext();
  const participants = useParticipants();
  
  return {
    participants: participants.map(p => ({
      identity: p.identity,
      name: p.name || p.identity,
      isLocal: p.isLocal,
      isSpeaking: p.isSpeaking,
      audioEnabled: p.isAudioEnabled,
      videoEnabled: p.isVideoEnabled,
      connectionQuality: p.connectionQuality,
      joinedAt: p.joinedAt,
      permissions: p.permissions,
    })),
    localParticipant: participants.find(p => p.isLocal),
    remoteParticipants: participants.filter(p => !p.isLocal),
    participantCount: participants.length,
  };
}
```

#### **2. Combined Participant Management**
```typescript
// hooks/use-stream-participants.ts
export function useStreamParticipants(streamId: string) {
  // Database participants (roles, permissions)
  const { data: dbParticipants } = useQuery({
    queryKey: ["participants", "db", streamId],
    queryFn: () => fetchDbParticipants(streamId),
    staleTime: 5 * 60 * 1000, // 5 minutes (stable data)
  });
  
  // LiveKit participants (real-time presence)
  const liveKitParticipants = useLiveKitParticipants();
  
  // Merge database and LiveKit data
  const mergedParticipants = useMemo(() => {
    return liveKitParticipants.participants.map(liveParticipant => {
      const dbParticipant = dbParticipants?.find(
        db => db.user.id === liveParticipant.identity
      );
      
      return {
        // LiveKit real-time data
        ...liveParticipant,
        isOnline: true,
        
        // Database persistent data
        role: dbParticipant?.role || "VIEWER",
        canSpeak: dbParticipant?.canSpeak || false,
        canVideo: dbParticipant?.canVideo || false,
        user: dbParticipant?.user,
      };
    });
  }, [liveKitParticipants.participants, dbParticipants]);
  
  return {
    participants: mergedParticipants,
    onlineCount: liveKitParticipants.participantCount,
    totalCount: dbParticipants?.length || 0,
  };
}
```

### **Phase 2: Event-Driven Updates**

#### **1. LiveKit Event Handlers**
```typescript
// hooks/use-participant-events.ts
export function useParticipantEvents(streamId: string) {
  const room = useRoomContext();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!room) return;
    
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log("Participant joined:", participant.identity);
      
      // Update database
      updateParticipantStatus(streamId, participant.identity, "JOINED");
      
      // Invalidate queries
      queryClient.invalidateQueries(["participants", streamId]);
    };
    
    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log("Participant left:", participant.identity);
      
      // Update database
      updateParticipantStatus(streamId, participant.identity, "LEFT");
      
      // Invalidate queries
      queryClient.invalidateQueries(["participants", streamId]);
    };
    
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, streamId, queryClient]);
}
```

#### **2. Server Actions for Participant Management**
```typescript
// actions/participant-actions.ts
"use server";

export async function updateParticipantStatus(
  streamId: string, 
  userId: string, 
  status: ParticipantStatus
) {
  try {
    const participant = await db.streamParticipant.upsert({
      where: {
        streamId_userId: { streamId, userId }
      },
      update: {
        status,
        joinedAt: status === "JOINED" ? new Date() : undefined,
        leftAt: status === "LEFT" ? new Date() : undefined,
      },
      create: {
        streamId,
        userId,
        status,
        role: "VIEWER",
        joinedAt: status === "JOINED" ? new Date() : undefined,
      },
    });
    
    // Revalidate cache
    revalidatePath(`/backstage/${streamId}`);
    
    return { success: true, participant };
  } catch (error) {
    console.error("Failed to update participant status:", error);
    throw new Error("Failed to update participant status");
  }
}

export async function updateParticipantPermissions(
  streamId: string,
  userId: string,
  permissions: { canSpeak?: boolean; canVideo?: boolean; role?: ParticipantRole }
) {
  try {
    const participant = await db.streamParticipant.update({
      where: {
        streamId_userId: { streamId, userId }
      },
      data: permissions,
    });
    
    // Revalidate cache
    revalidatePath(`/backstage/${streamId}`);
    
    return { success: true, participant };
  } catch (error) {
    console.error("Failed to update participant permissions:", error);
    throw new Error("Failed to update participant permissions");
  }
}
```

### **Phase 3: Advanced Real-time Features**

#### **1. Participant Mutations with Optimistic Updates**
```typescript
// hooks/use-participant-mutations.ts
export function useParticipantMutations(streamId: string) {
  const queryClient = useQueryClient();
  
  const updatePermissions = useMutation({
    mutationFn: ({ userId, permissions }: {
      userId: string;
      permissions: { canSpeak?: boolean; canVideo?: boolean; role?: ParticipantRole };
    }) => updateParticipantPermissions(streamId, userId, permissions),
    
    onMutate: async ({ userId, permissions }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(["participants", streamId]);
      
      // Snapshot previous value
      const previousParticipants = queryClient.getQueryData(["participants", streamId]);
      
      // Optimistically update
      queryClient.setQueryData(["participants", streamId], (old: any) => {
        return old?.map((p: any) => 
          p.user.id === userId ? { ...p, ...permissions } : p
        );
      });
      
      return { previousParticipants };
    },
    
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousParticipants) {
        queryClient.setQueryData(["participants", streamId], context.previousParticipants);
      }
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(["participants", streamId]);
    },
  });
  
  return { updatePermissions };
}
```

#### **2. Real-time Participant Component**
```typescript
// components/backstage/real-time-participants.tsx
export function RealTimeParticipants({ streamId }: { streamId: string }) {
  const { participants, onlineCount, totalCount } = useStreamParticipants(streamId);
  const { updatePermissions } = useParticipantMutations(streamId);
  
  // Set up real-time event listeners
  useParticipantEvents(streamId);
  
  const handleTogglePermission = (userId: string, permission: string, value: boolean) => {
    updatePermissions.mutate({
      userId,
      permissions: { [permission]: value }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({onlineCount} online, {totalCount} total)
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.map((participant) => (
          <div key={participant.identity} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.user?.imageUrl} />
                  <AvatarFallback>
                    {participant.user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {participant.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">@{participant.user?.username}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {participant.role.replace("_", " ")}
                  </Badge>
                  {participant.isSpeaking && (
                    <Badge variant="secondary" className="text-xs">
                      Speaking
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Audio Permission */}
              <Button
                variant={participant.audioEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleTogglePermission(
                  participant.identity, 
                  "canSpeak", 
                  !participant.canSpeak
                )}
              >
                <Mic className="h-3 w-3" />
              </Button>
              
              {/* Video Permission */}
              <Button
                variant={participant.videoEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => handleTogglePermission(
                  participant.identity, 
                  "canVideo", 
                  !participant.canVideo
                )}
              >
                <Video className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## 🎯 Implementation Phases

### **Phase 1: Immediate (1-2 days)**
- ✅ Integrate LiveKit participant hooks
- ✅ Create hybrid participant management
- ✅ Add real-time presence indicators
- ✅ Basic event handling

### **Phase 2: Short-term (1 week)**
- ✅ Server actions for participant updates
- ✅ Optimistic UI updates
- ✅ Permission management
- ✅ Advanced event handling

### **Phase 3: Long-term (2-3 weeks)**
- ✅ Custom WebSocket layer
- ✅ Advanced participant features
- ✅ Participant analytics
- ✅ Moderation tools

## 🔧 Technical Benefits

### **Real-time Updates:**
- ✅ Instant participant join/leave
- ✅ Live audio/video status
- ✅ Speaking indicators
- ✅ Connection quality

### **Performance:**
- ✅ Reduced database polling
- ✅ Efficient caching strategy
- ✅ Optimistic updates
- ✅ Event-driven architecture

### **User Experience:**
- ✅ Live participant list
- ✅ Real-time permissions
- ✅ Instant feedback
- ✅ Smooth interactions

This strategy provides a robust, scalable solution for real-time participant management that leverages LiveKit's strengths while maintaining database consistency and providing excellent user experience.
