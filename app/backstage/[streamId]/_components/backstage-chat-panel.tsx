"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";
import { chatInputValueAtom } from "@/store/chat-atoms";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface BackstageChatPanelProps {
  streamId: string;
}

export function BackstageChatPanel({ streamId }: BackstageChatPanelProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    username: string;
    message: string;
    timestamp: number;
  }>>([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // TODO: Send message via LiveKit data channel
    const newMessage = {
      id: Date.now().toString(),
      username: "You",
      message: message.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="font-semibold text-lg">Chat</h3>
        <p className="text-xs text-muted-foreground">
          Communicate with participants
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{msg.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/40">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
