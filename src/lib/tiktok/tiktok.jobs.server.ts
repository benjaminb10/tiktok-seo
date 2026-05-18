import { and, eq, lt, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as schema from "#/db/schema";
import { sanitizeTikTokInfo, selectDisplayVideos } from "./tiktok.logic";
import { parsePayload, readPayloadString } from "./tiktok.payload";
import type { TikTokDb } from "./tiktok.db.server";
import type { LeasedJob, SanitizedTikTokVideo } from "./tiktok.types";
import {
  appendRunVideo,
  countRunVideos,
  markVideoDownloading,
  replaceRunVideos,
  upsertVideo,
} from "./tiktok.videos.server";

type SearchJobRow = typeof schema.searchJobs.$inferSelect;

type LeaseJobsOptions = {
  workerId: string;
  limit: number;
  now?: Date;
  leaseMs?: number;
};

type CompleteMetadataJobInput = {
  jobId: string;
  leaseToken: string;
  videos: unknown[];
  now?: Date;
};

type AppendMetadataJobVideosInput = {
  jobId: string;
  leaseToken: string;
  videos: unknown[];
  now?: Date;
};

type CreateDownloadJobsInput = {
  runId: string;
  now?: Date;
};

type CreateVideoDownloadJobInput = {
  runId: string;
  videoId: string;
  now?: Date;
};

type CompleteVideoJobInput = {
  jobId: string;
  leaseToken: string;
  localPath: string | null;
  now?: Date;
};

type FailJobInput = {
  jobId: string;
  leaseToken: string;
  error: string;
  now?: Date;
};

export class TikTokJobService {
  constructor(private readonly database: TikTokDb) {}

  async leaseJobs(options: LeaseJobsOptions): Promise<LeasedJob[]> {
    const now = options.now ?? new Date();
    const timestamp = now.getTime();
    const leaseMs = options.leaseMs ?? 60_000;
    const limit = Math.max(1, Math.min(options.limit, 5));

    const rows = await this.database
      .select()
      .from(schema.searchJobs)
      .where(
        or(
          eq(schema.searchJobs.status, "queued"),
          and(
            eq(schema.searchJobs.status, "leased"),
            lt(schema.searchJobs.leasedUntil, timestamp),
          ),
        ),
      )
      .orderBy(schema.searchJobs.createdAt)
      .limit(limit);

    const leased: LeasedJob[] = [];
    for (const row of rows) {
      leased.push(await this.leaseJob(row, options.workerId, timestamp, leaseMs));
    }

    return leased;
  }

  async completeMetadataJob(
    input: CompleteMetadataJobInput,
  ): Promise<{ totalDiscovered: number; totalSelected: number }> {
    const now = input.now ?? new Date();
    const timestamp = now.getTime();
    const job = await this.requireLeasedJob(input.jobId, input.leaseToken);
    if (job.type !== "metadata_scan") {
      throw new Error("Job metadata attendu.");
    }

    const uniqueVideos = this.sanitizeUniqueVideos(input.videos);
    for (const video of uniqueVideos) {
      await upsertVideo(this.database, video, timestamp);
    }

    // Extract avatar URL by fetching from TikTok profile page
    const avatarUrl = await this.extractAvatarUrl(input.videos);

    const selected = selectDisplayVideos(uniqueVideos);
    await replaceRunVideos(this.database, job.runId, selected, timestamp);
    await this.markJobCompleted(job.id, timestamp);
    await this.markMetadataRunCompleted({
      runId: job.runId,
      totalDiscovered: input.videos.length,
      totalSelected: selected.length,
      metadataProcessed: uniqueVideos.length,
      avatarUrl,
      timestamp,
    });

    return {
      totalDiscovered: input.videos.length,
      totalSelected: selected.length,
    };
  }

  async appendMetadataJobVideos(
    input: AppendMetadataJobVideosInput,
  ): Promise<{ appended: number; totalSelected: number }> {
    const now = input.now ?? new Date();
    const timestamp = now.getTime();
    const job = await this.requireLeasedJob(input.jobId, input.leaseToken);
    if (job.type !== "metadata_scan") {
      throw new Error("Job metadata attendu.");
    }

    const existingCount = await countRunVideos(this.database, job.runId);
    let appended = 0;

    for (const video of this.sanitizeUniqueVideos(input.videos)) {
      await upsertVideo(this.database, video, timestamp);
      await appendRunVideo(this.database, {
        runId: job.runId,
        videoId: video.id,
        rank: existingCount + appended + 1,
        timestamp,
      });

      const nextCount = await countRunVideos(this.database, job.runId);
      if (nextCount > existingCount + appended) {
        appended += 1;
      }
    }

    const totalSelected = await countRunVideos(this.database, job.runId);
    await this.extendJobLease(job.id, timestamp, 60_000);
    await this.markMetadataRunRunning({
      runId: job.runId,
      totalSelected,
      timestamp,
    });

    return { appended, totalSelected };
  }

  async createDownloadJobs(
    input: CreateDownloadJobsInput,
  ): Promise<{ created: number }> {
    const now = input.now ?? new Date();
    const timestamp = now.getTime();
    const rows = await this.findDownloadableRunVideos(input.runId);

    for (const row of rows) {
      await this.queueVideoDownloadJob(row, timestamp);
      await this.markVideoQueued(row.runId, row.videoId, timestamp);
    }

    if (rows.length > 0) {
      await this.incrementVideoJobsTotal(input.runId, rows.length, timestamp);
    }

    return { created: rows.length };
  }

  async createVideoDownloadJob(
    input: CreateVideoDownloadJobInput,
  ): Promise<{ created: number }> {
    const now = input.now ?? new Date();
    const timestamp = now.getTime();
    const row = await this.findDownloadableRunVideo({
      runId: input.runId,
      videoId: input.videoId,
    });

    if (!row) return { created: 0 };

    await this.queueVideoDownloadJob(row, timestamp);
    await this.markVideoQueued(row.runId, row.videoId, timestamp);
    await this.incrementVideoJobsTotal(input.runId, 1, timestamp);

    return { created: 1 };
  }

  async completeVideoJob(input: CompleteVideoJobInput): Promise<void> {
    const now = input.now ?? new Date();
    const timestamp = now.getTime();
    const job = await this.requireLeasedJob(input.jobId, input.leaseToken);
    if (job.type !== "video_download") {
      throw new Error("Job video attendu.");
    }

    const payload = parsePayload(job.payloadJson);
    const runId = readPayloadString(payload, "runId");
    const videoId = readPayloadString(payload, "videoId");
    if (!runId || !videoId) {
      throw new Error("Payload video invalide.");
    }

    await this.markJobCompleted(job.id, timestamp);
    await this.markVideoDownloaded({
      runId,
      videoId,
      localPath: input.localPath,
      timestamp,
    });
    await this.incrementVideoJobsCompleted(runId, timestamp);
  }

  async failJob(input: FailJobInput): Promise<void> {
    const now = input.now ?? new Date();
    const timestamp = now.getTime();
    const job = await this.requireLeasedJob(input.jobId, input.leaseToken);

    await this.markJobFailed(job.id, input.error, timestamp);

    if (job.type === "metadata_scan") {
      await this.markRunFailed(job.runId, input.error, timestamp);
      return;
    }

    const payload = parsePayload(job.payloadJson);
    const runId = readPayloadString(payload, "runId");
    const videoId = readPayloadString(payload, "videoId");
    if (!runId || !videoId) return;

    await this.markVideoFailed(runId, videoId, timestamp);
    await this.incrementVideoJobsFailed(runId, timestamp);
  }

  private async leaseJob(
    row: SearchJobRow,
    workerId: string,
    timestamp: number,
    leaseMs: number,
  ): Promise<LeasedJob> {
    const leaseToken = nanoid();
    const leasedUntil = timestamp + leaseMs;

    await this.database
      .update(schema.searchJobs)
      .set({
        status: "leased",
        leaseToken,
        leaseOwner: workerId,
        leasedUntil,
        attempts: sql`${schema.searchJobs.attempts} + 1`,
        updatedAt: timestamp,
      })
      .where(eq(schema.searchJobs.id, row.id));

    const payload = parsePayload(row.payloadJson);
    await this.applyLeaseSideEffects({
      type: row.type,
      runId: row.runId,
      payload,
      timestamp,
    });

    return {
      id: row.id,
      runId: row.runId,
      type: row.type,
      payload,
      leaseToken,
      leasedUntil,
    };
  }

  private async applyLeaseSideEffects(input: {
    type: LeasedJob["type"];
    runId: string;
    payload: Record<string, unknown>;
    timestamp: number;
  }) {
    if (input.type === "video_download") {
      const runId = readPayloadString(input.payload, "runId");
      const videoId = readPayloadString(input.payload, "videoId");
      if (runId && videoId) {
        await markVideoDownloading(this.database, {
          runId,
          videoId,
          timestamp: input.timestamp,
        });
      }
      return;
    }

    await this.database
      .update(schema.searchRuns)
      .set({ status: "running", updatedAt: input.timestamp })
      .where(eq(schema.searchRuns.id, input.runId));
  }

  private async requireLeasedJob(
    jobId: string,
    leaseToken: string,
  ): Promise<SearchJobRow> {
    const [job] = await this.database
      .select()
      .from(schema.searchJobs)
      .where(
        and(
          eq(schema.searchJobs.id, jobId),
          eq(schema.searchJobs.leaseToken, leaseToken),
          eq(schema.searchJobs.status, "leased"),
        ),
      );

    if (!job) {
      throw new Error("Job introuvable ou lease invalide.");
    }

    return job;
  }

  private async markJobCompleted(jobId: string, timestamp: number) {
    await this.database
      .update(schema.searchJobs)
      .set({
        status: "completed",
        completedAt: timestamp,
        updatedAt: timestamp,
      })
      .where(eq(schema.searchJobs.id, jobId));
  }

  private async markJobFailed(
    jobId: string,
    error: string,
    timestamp: number,
  ) {
    await this.database
      .update(schema.searchJobs)
      .set({
        status: "failed",
        error,
        completedAt: timestamp,
        updatedAt: timestamp,
      })
      .where(eq(schema.searchJobs.id, jobId));
  }

  private async extendJobLease(
    jobId: string,
    timestamp: number,
    leaseMs: number,
  ) {
    await this.database
      .update(schema.searchJobs)
      .set({
        leasedUntil: timestamp + leaseMs,
        updatedAt: timestamp,
      })
      .where(eq(schema.searchJobs.id, jobId));
  }

  private async markMetadataRunCompleted(input: {
    runId: string;
    totalDiscovered: number;
    totalSelected: number;
    metadataProcessed: number;
    avatarUrl: string | null;
    timestamp: number;
  }) {
    await this.database
      .update(schema.searchRuns)
      .set({
        status: "completed",
        totalDiscovered: input.totalDiscovered,
        totalSelected: input.totalSelected,
        metadataProcessed: input.metadataProcessed,
        avatarUrl: input.avatarUrl,
        updatedAt: input.timestamp,
      })
      .where(eq(schema.searchRuns.id, input.runId));
  }

  private async markMetadataRunRunning(input: {
    runId: string;
    totalSelected: number;
    timestamp: number;
  }) {
    await this.database
      .update(schema.searchRuns)
      .set({
        status: "running",
        totalDiscovered: input.totalSelected,
        totalSelected: input.totalSelected,
        metadataProcessed: input.totalSelected,
        updatedAt: input.timestamp,
      })
      .where(eq(schema.searchRuns.id, input.runId));
  }

  private async markRunFailed(
    runId: string,
    error: string,
    timestamp: number,
  ) {
    await this.database
      .update(schema.searchRuns)
      .set({ status: "failed", error, updatedAt: timestamp })
      .where(eq(schema.searchRuns.id, runId));
  }

  private async findDownloadableRunVideos(runId: string) {
    return this.database
      .select({
        runId: schema.searchRunVideos.runId,
        videoId: schema.searchRunVideos.videoId,
        webpageUrl: schema.tiktokVideos.webpageUrl,
      })
      .from(schema.searchRunVideos)
      .innerJoin(
        schema.tiktokVideos,
        eq(schema.searchRunVideos.videoId, schema.tiktokVideos.id),
      )
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          or(
            eq(schema.searchRunVideos.videoStatus, "idle"),
            and(
              eq(schema.searchRunVideos.videoStatus, "downloaded"),
              or(
                sql`${schema.searchRunVideos.localPath} is null`,
                eq(schema.searchRunVideos.localPath, ""),
              ),
            ),
          ),
        ),
      )
      .orderBy(schema.searchRunVideos.rank);
  }

  private async findDownloadableRunVideo(input: {
    runId: string;
    videoId: string;
  }) {
    const [row] = await this.database
      .select({
        runId: schema.searchRunVideos.runId,
        videoId: schema.searchRunVideos.videoId,
        webpageUrl: schema.tiktokVideos.webpageUrl,
      })
      .from(schema.searchRunVideos)
      .innerJoin(
        schema.tiktokVideos,
        eq(schema.searchRunVideos.videoId, schema.tiktokVideos.id),
      )
      .where(
        and(
          eq(schema.searchRunVideos.runId, input.runId),
          eq(schema.searchRunVideos.videoId, input.videoId),
          or(
            eq(schema.searchRunVideos.videoStatus, "idle"),
            eq(schema.searchRunVideos.videoStatus, "failed"),
            and(
              eq(schema.searchRunVideos.videoStatus, "downloaded"),
              or(
                sql`${schema.searchRunVideos.localPath} is null`,
                eq(schema.searchRunVideos.localPath, ""),
              ),
            ),
          ),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  private async queueVideoDownloadJob(
    row: { runId: string; videoId: string; webpageUrl: string },
    timestamp: number,
  ) {
    await this.database.insert(schema.searchJobs).values({
      id: nanoid(),
      runId: row.runId,
      type: "video_download",
      status: "queued",
      payloadJson: JSON.stringify({
        runId: row.runId,
        videoId: row.videoId,
        url: row.webpageUrl,
      }),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  private async markVideoQueued(
    runId: string,
    videoId: string,
    timestamp: number,
  ) {
    await this.database
      .update(schema.searchRunVideos)
      .set({ videoStatus: "queued", updatedAt: timestamp })
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          eq(schema.searchRunVideos.videoId, videoId),
        ),
      );
  }

  private async markVideoDownloaded(input: {
    runId: string;
    videoId: string;
    localPath: string | null;
    timestamp: number;
  }) {
    await this.database
      .update(schema.searchRunVideos)
      .set({
        videoStatus: "downloaded",
        localPath: input.localPath,
        updatedAt: input.timestamp,
      })
      .where(
        and(
          eq(schema.searchRunVideos.runId, input.runId),
          eq(schema.searchRunVideos.videoId, input.videoId),
        ),
      );

    await this.database
      .update(schema.tiktokVideos)
      .set({ downloadedLocalPath: input.localPath, updatedAt: input.timestamp })
      .where(eq(schema.tiktokVideos.id, input.videoId));
  }

  private async markVideoFailed(
    runId: string,
    videoId: string,
    timestamp: number,
  ) {
    await this.database
      .update(schema.searchRunVideos)
      .set({ videoStatus: "failed", updatedAt: timestamp })
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          eq(schema.searchRunVideos.videoId, videoId),
        ),
      );
  }

  private async incrementVideoJobsTotal(
    runId: string,
    count: number,
    timestamp: number,
  ) {
    await this.database
      .update(schema.searchRuns)
      .set({
        videoJobsTotal: sql`${schema.searchRuns.videoJobsTotal} + ${count}`,
        updatedAt: timestamp,
      })
      .where(eq(schema.searchRuns.id, runId));
  }

  private async incrementVideoJobsCompleted(
    runId: string,
    timestamp: number,
  ) {
    await this.database
      .update(schema.searchRuns)
      .set({
        videoJobsCompleted: sql`${schema.searchRuns.videoJobsCompleted} + 1`,
        updatedAt: timestamp,
      })
      .where(eq(schema.searchRuns.id, runId));
  }

  private async incrementVideoJobsFailed(runId: string, timestamp: number) {
    await this.database
      .update(schema.searchRuns)
      .set({
        videoJobsFailed: sql`${schema.searchRuns.videoJobsFailed} + 1`,
        updatedAt: timestamp,
      })
      .where(eq(schema.searchRuns.id, runId));
  }

  private sanitizeUniqueVideos(videos: unknown[]): SanitizedTikTokVideo[] {
    const byId = new Map<string, SanitizedTikTokVideo>();
    for (const raw of videos) {
      const sanitized = sanitizeTikTokInfo(raw);
      byId.set(sanitized.id, sanitized);
    }
    return Array.from(byId.values());
  }

  private async extractAvatarUrl(videos: unknown[]): Promise<string | null> {
    // yt-dlp doesn't expose TikTok profile avatars in video metadata
    // We need to fetch it from the profile page directly
    for (const raw of videos) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
      const record = raw as Record<string, unknown>;

      const uploaderUrl = this.readString(record, "uploader_url");
      if (uploaderUrl && uploaderUrl.includes("tiktok.com/@")) {
        try {
          return await this.fetchProfileAvatarFromWeb(uploaderUrl);
        } catch (error) {
          console.error("[extractAvatarUrl] Failed to fetch avatar from profile page:", error);
        }
      }
    }
    return null;
  }

  private async fetchProfileAvatarFromWeb(profileUrl: string): Promise<string | null> {
    try {
      const response = await fetch(profileUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      if (!response.ok) return null;

      const html = await response.text();

      // TikTok embeds user data in a <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"> tag
      const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s);
      if (!match) return null;

      const jsonData = JSON.parse(match[1] || "{}");
      const userDetail = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user;

      // Try to get the avatar URL from the user data
      const avatarUrl =
        userDetail?.avatarLarger ||
        userDetail?.avatarMedium ||
        userDetail?.avatarThumb ||
        userDetail?.avatar;

      if (typeof avatarUrl === "string" && avatarUrl.startsWith("http")) {
        console.log("[fetchProfileAvatarFromWeb] Found avatar:", avatarUrl);
        return avatarUrl;
      }

      return null;
    } catch (error) {
      console.error("[fetchProfileAvatarFromWeb] Error:", error);
      return null;
    }
  }

  private readString(record: Record<string, unknown>, key: string): string | null {
    const value = record[key];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
}

export async function leaseJobs(
  database: TikTokDb,
  options: LeaseJobsOptions,
): Promise<LeasedJob[]> {
  return new TikTokJobService(database).leaseJobs(options);
}

export async function completeMetadataJob(
  database: TikTokDb,
  input: CompleteMetadataJobInput,
): Promise<{ totalDiscovered: number; totalSelected: number }> {
  return new TikTokJobService(database).completeMetadataJob(input);
}

export async function appendMetadataJobVideos(
  database: TikTokDb,
  input: AppendMetadataJobVideosInput,
): Promise<{ appended: number; totalSelected: number }> {
  return new TikTokJobService(database).appendMetadataJobVideos(input);
}

export async function createDownloadJobs(
  database: TikTokDb,
  input: CreateDownloadJobsInput,
): Promise<{ created: number }> {
  return new TikTokJobService(database).createDownloadJobs(input);
}

export async function createVideoDownloadJob(
  database: TikTokDb,
  input: CreateVideoDownloadJobInput,
): Promise<{ created: number }> {
  return new TikTokJobService(database).createVideoDownloadJob(input);
}

export async function completeVideoJob(
  database: TikTokDb,
  input: CompleteVideoJobInput,
): Promise<void> {
  return new TikTokJobService(database).completeVideoJob(input);
}

export async function failJob(
  database: TikTokDb,
  input: FailJobInput,
): Promise<void> {
  return new TikTokJobService(database).failJob(input);
}
