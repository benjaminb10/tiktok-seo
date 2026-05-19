import type { UnifiedVideo } from "#/features/analysis/types";
import type { VideoContext, TopVideo, VideoStats } from "./chat.types";

const TOP_VIDEOS_COUNT = 30;

export function buildVideoContext(
  handle: string,
  videos: UnifiedVideo[],
): VideoContext {
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + (v.viewCount ?? 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likeCount ?? 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.commentCount ?? 0), 0);

  const avgViews = totalVideos > 0 ? totalViews / totalVideos : 0;
  const avgLikes = totalVideos > 0 ? totalLikes / totalVideos : 0;

  // Calculate average engagement rate
  let totalEngagement = 0;
  for (const video of videos) {
    if (video.viewCount && video.viewCount > 0) {
      const interactions =
        (video.likeCount ?? 0) + (video.commentCount ?? 0) + (video.repostCount ?? 0);
      totalEngagement += interactions / video.viewCount;
    }
  }
  const avgEngagement = totalVideos > 0 ? totalEngagement / totalVideos : 0;

  const stats: VideoStats = {
    totalViews,
    totalLikes,
    totalComments,
    avgViews,
    avgLikes,
    avgEngagement,
  };

  // Sort by views and take top videos
  const topVideos: TopVideo[] = [...videos]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, TOP_VIDEOS_COUNT)
    .map((v) => ({
      title: v.title,
      description: v.description,
      viewCount: v.viewCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      repostCount: v.repostCount,
      tags: v.tags,
      publishedAt: v.publishedAt,
    }));

  return {
    handle,
    totalVideos,
    stats,
    topVideos,
  };
}
