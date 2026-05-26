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
