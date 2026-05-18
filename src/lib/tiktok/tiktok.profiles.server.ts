import { desc, eq, sql } from "drizzle-orm";
import { db } from "#/db";
import { searchRuns, searchRunVideos, tiktokVideos } from "#/db/schema";

export type ProfileSummary = {
  handle: string;
  avatarUrl: string | null;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  lastAnalyzed: number;
  analysisCount: number;
};

export type ProfileVideo = {
  id: string;
  webpageUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  publishedAt: string | null;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
  tags: string[];
};

export type ProfileDetail = {
  handle: string;
  avatarUrl: string | null;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  lastAnalyzed: number;
  analysisCount: number;
  videos: ProfileVideo[];
};

export async function getAnalyzedProfiles(): Promise<ProfileSummary[]> {

  // Get all completed profile runs grouped by handle
  const profiles = await db
    .select({
      handle: searchRuns.handle,
      runId: searchRuns.id,
      avatarUrl: searchRuns.avatarUrl,
      createdAt: searchRuns.createdAt,
    })
    .from(searchRuns)
    .where(eq(searchRuns.kind, "profile"))
    .where(eq(searchRuns.status, "completed"))
    .orderBy(desc(searchRuns.createdAt))
    .all();

  if (profiles.length === 0) {
    return [];
  }

  // Group by handle and get stats
  const handleMap = new Map<string, { runIds: string[]; lastAnalyzed: number; avatarUrl: string | null }>();

  for (const profile of profiles) {
    if (!profile.handle) continue;

    const existing = handleMap.get(profile.handle);
    if (existing) {
      existing.runIds.push(profile.runId);
      existing.lastAnalyzed = Math.max(existing.lastAnalyzed, profile.createdAt);
      // Use the most recent avatar URL if available
      if (profile.createdAt > existing.lastAnalyzed && profile.avatarUrl) {
        existing.avatarUrl = profile.avatarUrl;
      }
    } else {
      handleMap.set(profile.handle, {
        runIds: [profile.runId],
        lastAnalyzed: profile.createdAt,
        avatarUrl: profile.avatarUrl,
      });
    }
  }

  // Get video stats for each handle
  const profileSummaries: ProfileSummary[] = [];

  for (const [handle, data] of handleMap.entries()) {
    // Get most recent run for this handle
    const mostRecentRunId = data.runIds[0];

    // Get video stats for the most recent run
    const videoStats = await db
      .select({
        videoCount: sql<number>`COUNT(DISTINCT ${searchRunVideos.videoId})`,
        totalViews: sql<number>`SUM(${tiktokVideos.viewCount})`,
        totalLikes: sql<number>`SUM(${tiktokVideos.likeCount})`,
      })
      .from(searchRunVideos)
      .innerJoin(tiktokVideos, eq(searchRunVideos.videoId, tiktokVideos.id))
      .where(eq(searchRunVideos.runId, mostRecentRunId))
      .get();

    profileSummaries.push({
      handle,
      avatarUrl: data.avatarUrl,
      totalVideos: Number(videoStats?.videoCount || 0),
      totalViews: Number(videoStats?.totalViews || 0),
      totalLikes: Number(videoStats?.totalLikes || 0),
      lastAnalyzed: data.lastAnalyzed,
      analysisCount: data.runIds.length,
    });
  }

  // Sort by last analyzed (most recent first)
  return profileSummaries.sort((a, b) => b.lastAnalyzed - a.lastAnalyzed);
}

export async function getProfileDetail(handle: string): Promise<ProfileDetail | null> {
  // Get all completed runs for this handle
  const runs = await db
    .select({
      id: searchRuns.id,
      avatarUrl: searchRuns.avatarUrl,
      createdAt: searchRuns.createdAt,
    })
    .from(searchRuns)
    .where(eq(searchRuns.handle, handle))
    .where(eq(searchRuns.kind, "profile"))
    .where(eq(searchRuns.status, "completed"))
    .orderBy(desc(searchRuns.createdAt))
    .all();

  if (runs.length === 0) {
    return null;
  }

  // Use the most recent run
  const mostRecentRun = runs[0];
  const avatarUrl = runs.find(r => r.avatarUrl)?.avatarUrl || null;

  // Get all videos from the most recent run
  const videoRows = await db
    .select({
      id: tiktokVideos.id,
      webpageUrl: tiktokVideos.webpageUrl,
      thumbnailUrl: tiktokVideos.thumbnailUrl,
      title: tiktokVideos.title,
      description: tiktokVideos.description,
      publishedAt: tiktokVideos.publishedAt,
      viewCount: tiktokVideos.viewCount,
      likeCount: tiktokVideos.likeCount,
      commentCount: tiktokVideos.commentCount,
      tagsJson: tiktokVideos.tagsJson,
      rank: searchRunVideos.rank,
    })
    .from(searchRunVideos)
    .innerJoin(tiktokVideos, eq(searchRunVideos.videoId, tiktokVideos.id))
    .where(eq(searchRunVideos.runId, mostRecentRun.id))
    .orderBy(searchRunVideos.rank)
    .all();

  // Calculate aggregate stats
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;

  const videos: ProfileVideo[] = videoRows.map((row) => {
    totalViews += row.viewCount || 0;
    totalLikes += row.likeCount || 0;
    totalComments += row.commentCount || 0;

    return {
      id: row.id,
      webpageUrl: row.webpageUrl,
      thumbnailUrl: row.thumbnailUrl,
      title: row.title,
      description: row.description,
      publishedAt: row.publishedAt,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      commentCount: row.commentCount,
      tags: JSON.parse(row.tagsJson) as string[],
    };
  });

  return {
    handle,
    avatarUrl,
    totalVideos: videos.length,
    totalViews,
    totalLikes,
    totalComments,
    lastAnalyzed: mostRecentRun.createdAt,
    analysisCount: runs.length,
    videos,
  };
}
