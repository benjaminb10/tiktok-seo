import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "#/db";
import { searchRuns, searchRunVideos, tiktokVideos, searchJobs } from "#/db/schema";

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
  handle: string | null;
  webpageUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  publishedAt: string | null;
  uploadDate: string | null;
  durationSeconds: number | null;
  viewCount: number | null;
  likeCount: number | null;
  repostCount: number | null;
  commentCount: number | null;
  tags: string[];
  audioTrack: string | null;
  audioAuthor: string | null;
  transcriptText: string | null;
  source: string;
  rank: number;
  videoStatus: string;
  localPath: string | null;
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
    .where(
      and(
        eq(searchRuns.kind, "profile"),
        eq(searchRuns.status, "completed")
      )
    )
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
      handle: searchRuns.handle,
      avatarUrl: searchRuns.avatarUrl,
      createdAt: searchRuns.createdAt,
    })
    .from(searchRuns)
    .where(
      and(
        eq(searchRuns.handle, handle),
        eq(searchRuns.kind, "profile"),
        eq(searchRuns.status, "completed")
      )
    )
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
      handle: tiktokVideos.handle,
      webpageUrl: tiktokVideos.webpageUrl,
      thumbnailUrl: tiktokVideos.thumbnailUrl,
      title: tiktokVideos.title,
      description: tiktokVideos.description,
      publishedAt: tiktokVideos.publishedAt,
      uploadDate: tiktokVideos.uploadDate,
      durationSeconds: tiktokVideos.durationSeconds,
      viewCount: tiktokVideos.viewCount,
      likeCount: tiktokVideos.likeCount,
      repostCount: tiktokVideos.repostCount,
      commentCount: tiktokVideos.commentCount,
      tagsJson: tiktokVideos.tagsJson,
      audioTrack: tiktokVideos.audioTrack,
      audioAuthor: tiktokVideos.audioAuthor,
      transcriptText: tiktokVideos.transcriptText,
      source: searchRunVideos.source,
      rank: searchRunVideos.rank,
      videoStatus: searchRunVideos.videoStatus,
      localPath: searchRunVideos.localPath,
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
      handle: row.handle,
      webpageUrl: row.webpageUrl,
      thumbnailUrl: row.thumbnailUrl,
      title: row.title,
      description: row.description,
      publishedAt: row.publishedAt,
      uploadDate: row.uploadDate,
      durationSeconds: row.durationSeconds,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      repostCount: row.repostCount,
      commentCount: row.commentCount,
      tags: JSON.parse(row.tagsJson) as string[],
      audioTrack: row.audioTrack,
      audioAuthor: row.audioAuthor,
      transcriptText: row.transcriptText,
      source: row.source,
      rank: row.rank,
      videoStatus: row.videoStatus,
      localPath: row.localPath,
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

export async function deleteProfile(handle: string): Promise<{ deleted: boolean }> {
  // Get all runs for this handle
  const runs = await db
    .select({ id: searchRuns.id })
    .from(searchRuns)
    .where(
      and(
        eq(searchRuns.handle, handle),
        eq(searchRuns.kind, "profile")
      )
    )
    .all();

  if (runs.length === 0) {
    return { deleted: false };
  }

  const runIds = runs.map(r => r.id);

  // Delete in order: jobs -> searchRunVideos -> searchRuns
  // (videos in tiktokVideos table can stay as they might be referenced by other profiles)

  // Delete all jobs for these runs
  await db
    .delete(searchJobs)
    .where(inArray(searchJobs.runId, runIds))
    .run();

  // Delete all video associations for these runs
  await db
    .delete(searchRunVideos)
    .where(inArray(searchRunVideos.runId, runIds))
    .run();

  // Delete all runs for this handle
  await db
    .delete(searchRuns)
    .where(
      and(
        eq(searchRuns.handle, handle),
        eq(searchRuns.kind, "profile")
      )
    )
    .run();

  return { deleted: true };
}
