import { and, desc, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "#/db/schema";
import { normalizeTikTokInput } from "./tiktok.logic";
import type { TikTokDb } from "./tiktok.db.server";
import { getRunVideos } from "./tiktok.videos.server";
import type { RunDetails } from "./tiktok.types";

export async function createMetadataRun(
  database: TikTokDb,
  input: string,
  now = new Date(),
): Promise<{ runId: string; jobId: string }> {
  const normalized = normalizeTikTokInput(input);
  const runId = nanoid();
  const jobId = nanoid();
  const timestamp = now.getTime();

  await database.insert(schema.searchRuns).values({
    id: runId,
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

  return { runId, jobId };
}

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

export async function listAllRuns(database: TikTokDb) {
  const runs = await database
    .select()
    .from(schema.searchRuns)
    .orderBy(desc(schema.searchRuns.createdAt));

  return runs;
}
