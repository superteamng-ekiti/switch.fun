"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Copy, Check, UserPlus, Settings, Trash2, Clock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  createBackstageInvite,
  getStreamInvites,
  deactivateInvite,
} from "@/actions/backstage-invite";
import { ParticipantRole } from "@prisma/client";
import { cn } from "@/lib/utils";

interface BackstageInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
}

interface InviteData {
  id: string;
  token: string;
  role: ParticipantRole;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  creator: {
    username: string;
    imageUrl: string;
  };
}

export function BackstageInviteModal({
  isOpen,
  onClose,
  streamId,
}: BackstageInviteModalProps) {
  const [isPending, startTransition] = useTransition();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [existingInvites, setExistingInvites] = useState<InviteData[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [role, setRole] = useState<ParticipantRole>("SPEAKER");
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<string>("never");

  const loadInvites = useCallback(async () => {
    try {
      const result = await getStreamInvites(streamId);
      if (result.success) {
        setExistingInvites(result.invites);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load invites");
    }
  }, [streamId]);

  const handleCreateInvite = () => {
    startTransition(async () => {
      try {
        let expiresAt: Date | undefined;
        
        if (expiresIn !== "never") {
          const hours = parseInt(expiresIn);
          expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        }

        const result = await createBackstageInvite({
          streamId,
          role,
          maxUses: maxUses ? parseInt(maxUses) : undefined,
          expiresAt,
        });

        if (result.success) {
          toast.success("Invite created successfully!");
          setShowCreateForm(false);
          setMaxUses("");
          setExpiresIn("never");
          await loadInvites();
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to create invite");
      }
    });
  };

  const handleCopyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/backstage/join?token=${token}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(token);
      toast.success("Invite link copied to clipboard!");
      
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast.error("Failed to copy invite link");
    }
  };

  const handleDeactivateInvite = (inviteId: string) => {
    startTransition(async () => {
      try {
        await deactivateInvite(inviteId);
        toast.success("Invite deactivated");
        await loadInvites();
      } catch (error: any) {
        toast.error(error.message || "Failed to deactivate invite");
      }
    });
  };

  const formatExpiresAt = (expiresAt: Date | null) => {
    if (!expiresAt) return "Never expires";
    
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    return "Expires soon";
  };

  const getRoleColor = (role: ParticipantRole) => {
    switch (role) {
      case "HOST":
        return "bg-red-500";
      case "CO_HOST":
        return "bg-orange-500";
      case "SPEAKER":
        return "bg-blue-500";
      case "MODERATOR":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Load invites when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInvites();
    }
  }, [isOpen, loadInvites]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Backstage Invites
          </DialogTitle>
          <DialogDescription>
            Create invite links for people to join your backstage as speakers or co-hosts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Invite */}
          <div className="space-y-4">
            {!showCreateForm ? (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full"
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Invite
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Create New Invite</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as ParticipantRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPEAKER">Speaker</SelectItem>
                        <SelectItem value="CO_HOST">Co-Host</SelectItem>
                        <SelectItem value="MODERATOR">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Max Uses (optional)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      placeholder="Unlimited"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Expires</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateInvite}
                  disabled={isPending}
                  className="w-full"
                >
                  Create Invite
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Existing Invites */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Active Invites</h3>
              <Badge variant="secondary">
                {existingInvites.length} active
              </Badge>
            </div>

            {existingInvites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active invites</p>
                <p className="text-sm">Create your first invite to get started</p>
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="space-y-3">
                  {existingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={cn("text-white", getRoleColor(invite.role))}>
                          {invite.role.replace("_", " ")}
                        </Badge>
                        
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            {invite.maxUses && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{invite.usedCount}/{invite.maxUses}</span>
                              </div>
                            )}
                            {invite.expiresAt && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatExpiresAt(invite.expiresAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyInviteLink(invite.token)}
                        >
                          {copiedToken === invite.token ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateInvite(invite.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
