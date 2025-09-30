"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Image as ImageIcon,
  Video,
  Music,
  Upload,
  Play,
  Trash2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnail?: string;
  size: number;
  uploadedAt: number;
}

interface BackstageMediaPanelProps {
  streamId: string;
}

export function BackstageMediaPanel({ streamId }: BackstageMediaPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  
  // TODO: Fetch media assets from API
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = () => {
    // TODO: Implement file upload
    console.log("Upload media");
  };

  const handleShareToStream = (assetId: string) => {
    // TODO: Share asset to stream
    console.log("Share to stream:", assetId);
  };

  const handleDeleteAsset = (assetId: string) => {
    // TODO: Delete asset
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  const getAssetIcon = (type: MediaAsset["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">Media Assets</h3>
            <p className="text-xs text-muted-foreground">
              {assets.length} files uploaded
            </p>
          </div>
          <Button size="sm" onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Media Grid */}
      <ScrollArea className="flex-1">
        {filteredAssets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {assets.length === 0
                  ? "No media assets yet"
                  : "No results found"}
              </p>
              <p className="text-xs mt-1">
                {assets.length === 0
                  ? "Upload images, videos, or audio"
                  : "Try a different search term"}
              </p>
              {assets.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className={cn(
                  "group relative rounded-lg overflow-hidden border border-border/40 cursor-pointer transition-all hover:border-primary",
                  selectedAsset === asset.id && "border-primary ring-2 ring-primary/20"
                )}
                onClick={() => setSelectedAsset(asset.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {asset.thumbnail ? (
                    <img
                      src={asset.thumbnail}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">
                      {getAssetIcon(asset.type)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 bg-background">
                  <p className="text-xs font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(asset.size)}
                  </p>
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareToStream(asset.id);
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
