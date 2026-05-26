import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "#/db/schema";
import { normalizeTikTokInput } from "./tiktok.logic";
import type { TikTokDb } from "./tiktok.db.server";
import { getRunVideos } from "./tiktok.videos.server";
import type { RunDetails } from "./tiktok.types";
import {
  checkQuota,
  incrementUsage,
  getUserQuota,
  QuotaExceededError,
} from "#/lib/stripe/quota.server";
import { TIER_CONFIG } from "#/lib/stripe/stripe.config";

export async function createMetadataRun(
  database: TikTokDb,
  input: string,
  userId?: string | null,
  now = new Date(),
): Promise<{ runId: string; jobId: string }> {
  // Check quota before creating run (for authenticated users)
  if (userId) {
    await checkQuota(userId, "analysis");
  }

  const normalized = normalizeTikTokInput(input);
  const runId = nanoid();
  const jobId = nanoid();
  const timestamp = now.getTime();

  await database.insert(schema.searchRuns).values({
    id: runId,
    userId: userId ?? null,
    input,
    normalizedUrl: normalized.url,
    kind: normalized.kind,
    handle: normalized.handle,
    videoId: normalized.kind === "video" ? normalized.videoId : null,
    status: "queued",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await database.insert(schema.searchJobs).values({
    id: jobId,
    runId,
    type: "metadata_scan",
    status: "queued",
    payloadJson: JSON.stringify({
      url: normalized.url,
      input,
      kind: normalized.kind,
      ...(normalized.kind === "video" ? { videoId: normalized.videoId } : {}),
    }),
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  // Increment usage after successful creation
  if (userId) {
    await incrementUsage(userId, "analysis");
  }

  return { runId, jobId };
}

// Re-export QuotaExceededError for use in functions.ts
export { QuotaExceededError };

export async function getRunDetails(
  database: TikTokDb,
  runId: string,
): Promise<RunDetails | null> {
  const [run] = await database
    .select()
    .from(schema.searchRuns)
    .where(eq(schema.searchRuns.id, runId));

  if (!run) return null;

  return {
    run,
    videos: await getRunVideos(database, runId),
  };
}

export async function cancelRun(
  database: TikTokDb,
  runId: string,
  now = new Date(),
): Promise<void> {
  const timestamp = now.getTime();

  await database
    .update(schema.searchRuns)
    .set({ status: "cancelled", updatedAt: timestamp })
    .where(eq(schema.searchRuns.id, runId));

  await database
    .update(schema.searchJobs)
    .set({
      status: "failed",
      error: "Annulé par l'utilisateur",
      updatedAt: timestamp,
    })
    .where(
      and(
        eq(schema.searchJobs.runId, runId),
        inArray(schema.searchJobs.status, ["queued", "leased"]),
      ),
    );
}

export async function continueMetadataRun(
  database: TikTokDb,
  runId: string,
  now = new Date(),
): Promise<{ jobId: string }> {
  const [run] = await database
    .select()
    .from(schema.searchRuns)
    .where(eq(schema.searchRuns.id, runId));

  if (!run) {
    throw new Error(`Run ${runId} introuvable.`);
  }

  const jobId = nanoid();
  const timestamp = now.getTime();
  const playlistStart = run.totalDiscovered + 1;

  await database
    .update(schema.searchRuns)
    .set({ status: "running", updatedAt: timestamp })
    .where(eq(schema.searchRuns.id, runId));

  await database.insert(schema.searchJobs).values({
    id: jobId,
    runId,
    type: "metadata_scan",
    status: "queued",
    payloadJson: JSON.stringify({
      url: run.normalizedUrl,
      input: run.input,
      kind: run.kind,
      playlistStart,
      ...(run.kind === "video" ? { videoId: run.videoId } : {}),
    }),
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return { jobId };
}

const runSelectFields = {
  id: schema.searchRuns.id,
  input: schema.searchRuns.input,
  normalizedUrl: schema.searchRuns.normalizedUrl,
  kind: schema.searchRuns.kind,
  handle: schema.searchRuns.handle,
  videoId: schema.searchRuns.videoId,
  avatarUrl: schema.searchRuns.avatarUrl,
  status: schema.searchRuns.status,
  totalDiscovered: schema.searchRuns.totalDiscovered,
  totalSelected: schema.searchRuns.totalSelected,
  metadataProcessed: schema.searchRuns.metadataProcessed,
  videoJobsTotal: schema.searchRuns.videoJobsTotal,
  videoJobsCompleted: schema.searchRuns.videoJobsCompleted,
  videoJobsFailed: schema.searchRuns.videoJobsFailed,
  error: schema.searchRuns.error,
  createdAt: schema.searchRuns.createdAt,
  updatedAt: schema.searchRuns.updatedAt,
  totalViews: sql<number>`(
    SELECT COALESCE(SUM(${schema.tiktokVideos.viewCount}), 0)
    FROM ${schema.searchRunVideos}
    JOIN ${schema.tiktokVideos} ON ${schema.searchRunVideos.videoId} = ${schema.tiktokVideos.id}
    WHERE ${schema.searchRunVideos.runId} = ${schema.searchRuns.id}
  )`.as("total_views"),
};

export async function listAllRuns(database: TikTokDb) {
  const runs = await database
    .select(runSelectFields)
    .from(schema.searchRuns)
    .orderBy(desc(schema.searchRuns.createdAt));

  return runs;
}

export async function listUserRuns(database: TikTokDb, userId: string) {
  // Get user's tier to determine history limit
  const quota = await getUserQuota(userId);
  const historyDays = TIER_CONFIG[quota.tier].limits.historyDays;

  // Build query with optional history filter
  if (historyDays !== -1) {
    const cutoffTimestamp = Date.now() - historyDays * 24 * 60 * 60 * 1000;
    const runs = await database
      .select(runSelectFields)
      .from(schema.searchRuns)
      .where(
        and(
          eq(schema.searchRuns.userId, userId),
          gte(schema.searchRuns.createdAt, cutoffTimestamp)
        )
      )
      .orderBy(desc(schema.searchRuns.createdAt));
    return runs;
  }

  // Unlimited history
  const runs = await database
    .select(runSelectFields)
    .from(schema.searchRuns)
    .where(eq(schema.searchRuns.userId, userId))
    .orderBy(desc(schema.searchRuns.createdAt));

  return runs;
}

export type DashboardStats = {
  totalAnalyses: number;
  totalVideos: number;
  totalViews: number;
  avgEngagement: number;
  lastAnalysis: {
    id: string;
    handle: string | null;
    avatarUrl: string | null;
    videoCount: number;
    totalViews: number;
    createdAt: number;
  } | null;
};

export type ShareData = {
  id: string;
  handle: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: number;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  avgEngagement: number;
  topVideos: Array<{
    id: string;
    thumbnailUrl: string | null;
    title: string | null;
    viewCount: number;
    likeCount: number;
  }>;
};

export async function getShareData(
  database: TikTokDb,
  runId: string,
): Promise<ShareData | null> {
  // Get run details
  const [run] = await database
    .select()
    .from(schema.searchRuns)
    .where(eq(schema.searchRuns.id, runId));

  if (!run || run.status !== "completed") {
    return null;
  }

  // Get video stats
  const videoStats = await database
    .select({
      totalVideos: sql<number>`COUNT(*)`,
      totalViews: sql<number>`COALESCE(SUM(${schema.tiktokVideos.viewCount}), 0)`,
      totalLikes: sql<number>`COALESCE(SUM(${schema.tiktokVideos.likeCount}), 0)`,
    })
    .from(schema.searchRunVideos)
    .innerJoin(
      schema.tiktokVideos,
      eq(schema.searchRunVideos.videoId, schema.tiktokVideos.id)
    )
    .where(eq(schema.searchRunVideos.runId, runId));

  const stats = videoStats[0] || { totalVideos: 0, totalViews: 0, totalLikes: 0 };
  const totalViews = Number(stats.totalViews) || 0;
  const totalLikes = Number(stats.totalLikes) || 0;
  const avgEngagement = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

  // Get top 3 videos
  const topVideos = await database
    .select({
      id: schema.tiktokVideos.id,
      thumbnailUrl: schema.tiktokVideos.thumbnailUrl,
      title: schema.tiktokVideos.title,
      viewCount: schema.tiktokVideos.viewCount,
      likeCount: schema.tiktokVideos.likeCount,
    })
    .from(schema.searchRunVideos)
    .innerJoin(
      schema.tiktokVideos,
      eq(schema.searchRunVideos.videoId, schema.tiktokVideos.id)
    )
    .where(eq(schema.searchRunVideos.runId, runId))
    .orderBy(desc(schema.tiktokVideos.viewCount))
    .limit(6);

  return {
    id: run.id,
    handle: run.handle,
    avatarUrl: run.avatarUrl,
    status: run.status,
    createdAt: run.createdAt,
    totalVideos: Number(stats.totalVideos) || 0,
    totalViews,
    totalLikes,
    avgEngagement,
    topVideos: topVideos.map((v) => ({
      id: v.id,
      thumbnailUrl: v.thumbnailUrl,
      title: v.title,
      viewCount: v.viewCount || 0,
      likeCount: v.likeCount || 0,
    })),
  };
}

export async function getDashboardStats(
  database: TikTokDb,
  userId: string,
): Promise<DashboardStats> {
  // Get all completed runs for user
  const runs = await database
    .select({
      id: schema.searchRuns.id,
      handle: schema.searchRuns.handle,
      avatarUrl: schema.searchRuns.avatarUrl,
      totalSelected: schema.searchRuns.totalSelected,
      createdAt: schema.searchRuns.createdAt,
      status: schema.searchRuns.status,
    })
    .from(schema.searchRuns)
    .where(eq(schema.searchRuns.userId, userId))
    .orderBy(desc(schema.searchRuns.createdAt));

  const completedRuns = runs.filter((r) => r.status === "completed");

  if (completedRuns.length === 0) {
    return {
      totalAnalyses: 0,
      totalVideos: 0,
      totalViews: 0,
      avgEngagement: 0,
      lastAnalysis: null,
    };
  }

  // Calculate aggregate stats
  const runIds = completedRuns.map((r) => r.id);

  const [videoStats] = await database
    .select({
      totalVideos: sql<number>`COUNT(DISTINCT ${schema.searchRunVideos.videoId})`,
      totalViews: sql<number>`COALESCE(SUM(${schema.tiktokVideos.viewCount}), 0)`,
      totalLikes: sql<number>`COALESCE(SUM(${schema.tiktokVideos.likeCount}), 0)`,
    })
    .from(schema.searchRunVideos)
    .innerJoin(
      schema.tiktokVideos,
      eq(schema.searchRunVideos.videoId, schema.tiktokVideos.id)
    )
    .where(inArray(schema.searchRunVideos.runId, runIds));

  const totalViews = Number(videoStats?.totalViews) || 0;
  const totalLikes = Number(videoStats?.totalLikes) || 0;
  const avgEngagement = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

  // Get last analysis details
  const lastRun = completedRuns[0];
  const [lastRunStats] = await database
    .select({
      totalViews: sql<number>`COALESCE(SUM(${schema.tiktokVideos.viewCount}), 0)`,
    })
    .from(schema.searchRunVideos)
    .innerJoin(
      schema.tiktokVideos,
      eq(schema.searchRunVideos.videoId, schema.tiktokVideos.id)
    )
    .where(eq(schema.searchRunVideos.runId, lastRun.id));

  return {
    totalAnalyses: completedRuns.length,
    totalVideos: Number(videoStats?.totalVideos) || 0,
    totalViews,
    avgEngagement,
    lastAnalysis: {
      id: lastRun.id,
      handle: lastRun.handle,
      avatarUrl: lastRun.avatarUrl,
      videoCount: lastRun.totalSelected,
      totalViews: Number(lastRunStats?.totalViews) || 0,
      createdAt: lastRun.createdAt,
    },
  };
}
