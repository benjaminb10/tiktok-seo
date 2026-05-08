import { eq } from "drizzle-orm";
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
