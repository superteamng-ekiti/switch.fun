"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BrowserGoLiveForm } from "./browser-go-live-form";

interface GoLiveWithBrowserProps {
  user: {
    id: string;
    username?: string;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const GoLiveWithBrowser = ({
  user,
  open = false,
  onOpenChange,
}: GoLiveWithBrowserProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          {/* <DialogTitle className="text-2xl font-bold font-sans">
            Create Browser Stream
          </DialogTitle> */}
        </DialogHeader>
        <BrowserGoLiveForm 
          user={user} 
          onClose={() => onOpenChange?.(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};
