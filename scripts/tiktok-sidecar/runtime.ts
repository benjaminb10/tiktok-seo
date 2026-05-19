import {
  readPayloadNumber,
  readPayloadString,
} from "../../src/lib/tiktok/tiktok.payload";
import { SidecarClient } from "./http-client";
import type { LeasedJob, SidecarConfig } from "./types";
import {
  collectTikTokMetadata,
  downloadTikTokVideo,
  enrichMetadataWithLocalSubtitles,
} from "./yt-dlp";

export async function runSidecar(config: SidecarConfig): Promise<void> {
  const client = new SidecarClient(config);
  const active = new Set<Promise<void>>();
  const POLL_INTERVAL = 5_000; // Re-poll every 5 seconds even during job processing

  while (true) {
    while (active.size < config.concurrency) {
      const jobs = await client.lease(config.concurrency - active.size);
      if (jobs.length === 0) break;

      console.info(`[sidecar] leased ${jobs.length} job(s)`);
      for (const job of jobs) {
        const task = handleJob(config, client, job).finally(() =>
          active.delete(task),
        );
        active.add(task);
      }
    }

    if (active.size === 0) {
      await sleep(2_000);
      continue;
    }

    // Wait for either a job to complete OR 5 seconds to pass (for re-polling)
    await Promise.race([...active, sleep(POLL_INTERVAL)]);
  }
}

async function handleJob(
  config: SidecarConfig,
  client: SidecarClient,
  job: LeasedJob,
): Promise<void> {
  try {
    if (job.type === "metadata_scan") {
      await handleMetadataJob(config, client, job);
      return;
    }

    await handleVideoDownloadJob(config, client, job);
  } catch (error) {
    await client.fail(job, error instanceof Error ? error.message : String(error));
  }
}

async function handleMetadataJob(
  config: SidecarConfig,
  client: SidecarClient,
  job: LeasedJob,
): Promise<void> {
  const url = readPayloadString(job.payload, "url");
  if (!url) throw new Error("metadata job missing url");

  const playlistStart = readPayloadNumber(job.payload, "playlistStart") ?? undefined;

  console.info(
    `[sidecar] metadata_scan job=${job.id} run=${job.runId} limit=${config.metadataLimit}${playlistStart ? ` start=${playlistStart}` : ""}`,
  );
  const videos = await collectMetadataJob(config, client, job, url, playlistStart);
  console.info(
    `[sidecar] metadata_scan complete job=${job.id} videos=${videos.length}`,
  );
  await client.complete(job, { leaseToken: job.leaseToken, videos });
}

async function handleVideoDownloadJob(
  config: SidecarConfig,
  client: SidecarClient,
  job: LeasedJob,
): Promise<void> {
  const url = readPayloadString(job.payload, "url");
  if (!url) throw new Error("video job missing url");

  console.info(`[sidecar] video_download job=${job.id} run=${job.runId}`);
  const localPath = await downloadTikTokVideo(config, url);
  if (!localPath) {
    throw new Error("Aucun fichier vidéo récupéré.");
  }
  await client.complete(job, { leaseToken: job.leaseToken, localPath });
}

async function collectMetadataJob(
  config: SidecarConfig,
  client: SidecarClient,
  job: LeasedJob,
  url: string,
  playlistStart?: number,
): Promise<unknown[]> {
  const videos: unknown[] = [];
  const activeProgress = new Set<Promise<void>>();
  const progressTasks: Array<Promise<void>> = [];

  await collectTikTokMetadata({
    config,
    url,
    playlistStart,
    onVideo: (video) => {
      videos.push(video);
      const task = enqueueProgress(
        config,
        client,
        job,
        video,
        activeProgress,
      ).finally(() => activeProgress.delete(task));
      activeProgress.add(task);
      progressTasks.push(task);
    },
  });

  const enrichedVideos = await enrichMetadataWithLocalSubtitles(config, videos);
  await Promise.all(progressTasks);
  return enrichedVideos;
}

async function enqueueProgress(
  config: SidecarConfig,
  client: SidecarClient,
  job: LeasedJob,
  video: unknown,
  activeProgress: Set<Promise<void>>,
): Promise<void> {
  while (activeProgress.size >= config.concurrency) {
    await Promise.race(activeProgress);
  }

  await client.progress(job, [video]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
