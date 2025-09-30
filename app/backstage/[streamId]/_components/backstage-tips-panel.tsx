"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tip {
  id: string;
  username: string;
  userImage?: string;
  amount: number;
  message?: string;
  giftName?: string;
  giftImage?: string;
  timestamp: number;
}

interface BackstageTipsPanelProps {
  streamId: string;
}

export function BackstageTipsPanel({ streamId }: BackstageTipsPanelProps) {
  // TODO: Fetch tips from API
  const [tips, setTips] = useState<Tip[]>([]);

  const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);
  const uniqueTippers = new Set(tips.map((t) => t.username)).size;
  const averageTip = tips.length > 0 ? totalTips / tips.length : 0;

  const topTippers = Object.entries(
    tips.reduce((acc, tip) => {
      acc[tip.username] = (acc[tip.username] || 0) + tip.amount;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const recentTips = [...tips].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Tips & Donations
        </h3>
        <p className="text-xs text-muted-foreground">
          Track your earnings and supporters
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalTips)}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{uniqueTippers}</p>
            <p className="text-xs text-muted-foreground">Tippers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {formatCurrency(averageTip)}
            </p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recent" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3">
          <TabsTrigger value="recent" className="flex-1">
            Recent
          </TabsTrigger>
          <TabsTrigger value="top" className="flex-1">
            Top Tippers
          </TabsTrigger>
        </TabsList>

        {/* Recent Tips */}
        <TabsContent value="recent" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            {recentTips.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No tips yet</p>
                  <p className="text-xs mt-1">Tips will appear here</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {recentTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={tip.userImage} />
                      <AvatarFallback className="text-xs">
                        {tip.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          @{tip.username}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {formatCurrency(tip.amount)}
                        </Badge>
                      </div>

                      {tip.giftName && (
                        <div className="flex items-center gap-2 mt-1">
                          {tip.giftImage && (
                            <img
                              src={tip.giftImage}
                              alt={tip.giftName}
                              className="w-4 h-4"
                            />
                          )}
                          <span className="text-xs text-muted-foreground">
                            Sent {tip.giftName}
                          </span>
                        </div>
                      )}

                      {tip.message && (
                        <p className="text-sm text-foreground/80 mt-1">
                          {tip.message}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(tip.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Top Tippers */}
        <TabsContent value="top" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            {topTippers.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No tippers yet</p>
                  <p className="text-xs mt-1">Top supporters will appear here</p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {topTippers.map(([username, amount], index) => {
                  const tip = tips.find((t) => t.username === username);
                  return (
                    <div
                      key={username}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 && "bg-yellow-500 text-yellow-950",
                          index === 1 && "bg-gray-400 text-gray-950",
                          index === 2 && "bg-orange-600 text-orange-950",
                          index > 2 && "bg-muted text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </div>

                      <Avatar className="w-10 h-10">
                        <AvatarImage src={tip?.userImage} />
                        <AvatarFallback className="text-xs">
                          {username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          @{username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tips.filter((t) => t.username === username).length}{" "}
                          tips
                        </p>
                      </div>

                      <Badge variant="default" className="text-sm">
                        {formatCurrency(amount)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
