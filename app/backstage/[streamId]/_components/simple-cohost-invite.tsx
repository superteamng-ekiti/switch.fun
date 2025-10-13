"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateCohostInviteLink } from "@/actions/cohost-invite";

interface SimpleCohostInviteProps {
  isOpen: boolean;
  onClose: () => void;
  streamId: string;
}

export function SimpleCohostInvite({
  isOpen,
  onClose,
  streamId,
}: SimpleCohostInviteProps) {
  const [isPending, startTransition] = useTransition();
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = () => {
    startTransition(async () => {
      try {
        const result = await generateCohostInviteLink(streamId);
        if (result.success) {
          setInviteUrl(result.inviteUrl);
          toast.success("Co-host invite link generated!");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to generate invite link");
      }
    });
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy invite link");
    }
  };

  const handleClose = () => {
    setInviteUrl("");
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Co-Host
          </DialogTitle>
          <DialogDescription>
            Generate a link to invite someone as a co-host to your backstage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!inviteUrl ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to generate a co-host invite link
              </p>
              <Button 
                onClick={handleGenerateLink}
                disabled={isPending}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Generate Co-Host Invite Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-url">Co-Host Invite Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-url"
                    value={inviteUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Share this link with someone you want to invite as a co-host</p>
                <p>• They&apos;ll be able to join your backstage with co-host permissions</p>
                <p>• The link doesn&apos;t expire and can be used multiple times</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setInviteUrl("")}
                  className="flex-1"
                >
                  Generate New Link
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
