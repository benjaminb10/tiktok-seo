import { useState } from "react";
import { Eye, Heart, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { PremiumBlur } from "#/components/ui/premium-blur";
import { useQuota } from "#/lib/stripe/quota-context";
import { formatNumber } from "#/features/tiktok/formatters";
import { getThumbnailUrl, type UnifiedVideo } from "./types";

const FREE_PREVIEW_COUNT = 3;

type RecentVideosPreviewProps = {
  videos: UnifiedVideo[];
  maxVideos?: number;
  onVideoClick?: (video: UnifiedVideo) => void;
  disablePremiumBlur?: boolean;
};

export function RecentVideosPreview({
  videos,
  maxVideos = 6,
  onVideoClick,
  disablePremiumBlur = false,
}: RecentVideosPreviewProps) {
  const displayVideos = videos.slice(0, maxVideos);
  const { quota } = useQuota();
  const isFree = !disablePremiumBlur && (!quota || quota.tier === "free");

  if (displayVideos.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Videos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
          {displayVideos.map((video, index) => (
            <VideoThumbnail
              key={video.id}
              video={video}
              onClick={onVideoClick}
              isLocked={isFree && index >= FREE_PREVIEW_COUNT}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type VideoThumbnailProps = {
  video: UnifiedVideo;
  onClick?: (video: UnifiedVideo) => void;
  isLocked?: boolean;
};

function VideoThumbnail({ video, onClick, isLocked = false }: VideoThumbnailProps) {
  const [imgError, setImgError] = useState(false);
  const thumbnailUrl = getThumbnailUrl(video.id);

  const handleClick = () => {
    if (onClick) {
      onClick(video);
    }
  };

  const content = (
    <>
      {/* Thumbnail */}
      {video.thumbnailUrl && !imgError ? (
        <img
          src={thumbnailUrl}
          alt={video.description || video.title || "TikTok video"}
          className="aspect-[9/16] w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="aspect-[9/16] w-full bg-muted flex items-center justify-center">
          <Play className="h-8 w-8 text-muted-foreground/50" />
        </div>
      )}

      {/* Video stats overlay */}
      <div className="p-2 bg-background/95">
        <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{formatNumber(video.viewCount ?? 0)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{formatNumber(video.likeCount ?? 0)}</span>
          </div>
        </div>
      </div>
    </>
  );

  // If we have an onClick handler, render as button; otherwise render as link
  if (onClick) {
    return (
      <button
        type="button"
        onClick={isLocked ? undefined : handleClick}
        className="group overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md text-left"
        disabled={isLocked}
      >
        <PremiumBlur isLocked={isLocked} label="Unlock">
          {content}
        </PremiumBlur>
      </button>
    );
  }

  if (isLocked) {
    return (
      <div className="group overflow-hidden rounded-lg border bg-background">
        <PremiumBlur isLocked={isLocked} label="Unlock">
          {content}
        </PremiumBlur>
      </div>
    );
  }

  return (
    <a
      href={video.webpageUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md"
    >
      {content}
    </a>
  );
}
