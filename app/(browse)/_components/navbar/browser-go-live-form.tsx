"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createBrowserStream } from "@/actions/browser-stream";

interface BrowserGoLiveFormProps {
  user: {
    id: string;
    username?: string;
  } | null;
  onClose?: () => void;
}

export const BrowserGoLiveForm = ({
  user,
  onClose,
}: BrowserGoLiveFormProps) => {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a stream title");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createBrowserStream({
          title: title.trim(),
        });

        if (result.success) {
          toast.success("Browser stream created successfully!");

          // Close modal first
          onClose?.();

          // Small delay to ensure modal closes, then redirect
          setTimeout(() => {
            const backstageUrl = `/backstage/${result.data.stream.id}`;

            // Try router.push first, fallback to window.location
            try {
              router.push(backstageUrl);
            } catch (err) {
              console.error("Router push failed, using window.location:", err);
              window.location.href = backstageUrl;
            }
          }, 100);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create stream"
        );
      }
    });
  };

  return (
    <div className="flex flex-col py-16 max-w-sm mx-auto">
      <h2 className="text-3xl font-semibold font-sans text-center mb-2">
        Start a New Stream
      </h2>
      <p className="text-gray-300 text-center mb-8">
        Add a title for your stream. You can update it later.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stream Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Stream Title
          </label>
          <Input
            type="text"
            placeholder="Enter your stream title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            disabled={isPending}
            className="bg-black border-border h-12 text-white placeholder-gray-400"
            autoFocus
          />
        </div>

        {/* Go Live Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={isPending || !title.trim()}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-md font-medium"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Stream...
              </>
            ) : (
              "Go Live"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
