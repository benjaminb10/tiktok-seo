import { Eye, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { formatNumber } from "#/features/tiktok/formatters";
import type { UnifiedVideo } from "./types";

type RecentVideosPreviewProps = {
  videos: UnifiedVideo[];
  maxVideos?: number;
  onVideoClick?: (video: UnifiedVideo) => void;
};

export function RecentVideosPreview({
  videos,
  maxVideos = 6,
  onVideoClick,
}: RecentVideosPreviewProps) {
  const displayVideos = videos.slice(0, maxVideos);

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
          {displayVideos.map((video) => (
            <VideoThumbnail
              key={video.id}
              video={video}
              onClick={onVideoClick}
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
};

function VideoThumbnail({ video, onClick }: VideoThumbnailProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(video);
    }
  };

  const content = (
    <>
      {/* Thumbnail */}
      {video.thumbnailUrl ? (
        <img
          src={video.thumbnailUrl}
          alt={video.description || video.title || "TikTok video"}
          className="aspect-[9/16] w-full object-cover"
        />
      ) : (
        <div className="aspect-[9/16] w-full bg-gradient-to-br from-pink-100 to-violet-100" />
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
        onClick={handleClick}
        className="group overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md text-left"
      >
        {content}
      </button>
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
