/**
 * Get the proxied thumbnail URL for a video.
 * Uses our R2 cache proxy to avoid TikTok CDN URL expiration issues.
 */
export function getThumbnailUrl(videoId: string): string {
  return `/api/thumbnail/${videoId}`;
}

/**
 * Get the proxied avatar URL for a TikTok handle.
 * Uses our R2 cache proxy to avoid TikTok CDN URL expiration issues.
 */
export function getAvatarUrl(handle: string): string {
  const normalizedHandle = handle.replace(/^@/, "").toLowerCase();
  return `/api/avatar/${normalizedHandle}`;
}

/**
 * Unified video type compatible with both ProfileVideo and RunVideoRow.
 * Used by shared analysis components (stats cards, videos table, etc.)
 */
export type UnifiedVideo = {
  id: string;
  handle?: string | null;
  webpageUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  publishedAt: string | null;
  uploadDate?: string | null;
  durationSeconds: number | null;
  viewCount: number | null;
  likeCount: number | null;
  repostCount: number | null;
  commentCount: number | null;
  tags: string[];
  audioTrack: string | null;
  audioAuthor: string | null;
  transcriptText: string | null;
};

/**
 * Extended video type with additional fields for app-specific features
 * (video download status, local path, etc.)
 */
export type UnifiedVideoExtended = UnifiedVideo & {
  source?: string;
  rank?: number;
  videoStatus?: string;
  localPath?: string | null;
};

/**
 * Aggregate stats computed from a list of videos
 */
export type UnifiedStats = {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgEngagement: number;
};

/**
 * Compute aggregate stats from a list of videos
 */
export function computeStats(videos: UnifiedVideo[]): UnifiedStats {
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + (v.viewCount ?? 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likeCount ?? 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.commentCount ?? 0), 0);

  // Average engagement rate across all videos
  let avgEngagement = 0;
  if (totalVideos > 0) {
    const engagements = videos.map((v) => {
      if (!v.viewCount) return 0;
      const interactions = (v.likeCount ?? 0) + (v.commentCount ?? 0) + (v.repostCount ?? 0);
      return interactions / v.viewCount;
    });
    avgEngagement = engagements.reduce((sum, e) => sum + e, 0) / totalVideos;
  }

  return {
    totalVideos,
    totalViews,
    totalLikes,
    totalComments,
    avgEngagement,
  };
}
