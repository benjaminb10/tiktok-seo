import { env } from "cloudflare:test";
import { and, eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "#/db/schema";
import {
  appendMetadataJobVideos,
  completeMetadataJob,
  createDownloadJobs,
  createVideoDownloadJob,
  createMetadataRun,
  leaseJobs,
} from "./tiktok.server";

function getDb() {
  return drizzle(env.DB, { schema });
}

beforeEach(async () => {
  await env.DB.prepare("DELETE FROM search_run_videos").run();
  await env.DB.prepare("DELETE FROM search_jobs").run();
  await env.DB.prepare("DELETE FROM tiktok_videos").run();
  await env.DB.prepare("DELETE FROM search_runs").run();
});

describe("TikTok D1 jobs", () => {
  it("creates a metadata run and one queued metadata job", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");

    const result = await createMetadataRun(db, "@creator", now);

    const [run] = await db
      .select()
      .from(schema.searchRuns)
      .where(eq(schema.searchRuns.id, result.runId));
    const [job] = await db
      .select()
      .from(schema.searchJobs)
      .where(eq(schema.searchJobs.id, result.jobId));

    expect(run).toMatchObject({
      input: "@creator",
      normalizedUrl: "https://www.tiktok.com/@creator",
      kind: "profile",
      handle: "creator",
      status: "queued",
    });
    expect(job).toMatchObject({
      runId: result.runId,
      type: "metadata_scan",
      status: "queued",
      attempts: 0,
    });
    expect(JSON.parse(job?.payloadJson ?? "{}")).toEqual({
      url: "https://www.tiktok.com/@creator",
      input: "@creator",
      kind: "profile",
    });
  });

  it("leases queued or expired jobs without leasing the same job twice", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    await createMetadataRun(db, "@creator", now);

    const [first] = await leaseJobs(db, {
      workerId: "worker-a",
      limit: 1,
      now,
      leaseMs: 30_000,
    });
    const second = await leaseJobs(db, {
      workerId: "worker-b",
      limit: 1,
      now,
      leaseMs: 30_000,
    });

    expect(first?.leaseToken).toBeTruthy();
    expect(first?.leasedUntil).toBe(now.getTime() + 30_000);
    expect(second).toEqual([]);

    await db
      .update(schema.searchJobs)
      .set({ leasedUntil: now.getTime() - 1 })
      .where(eq(schema.searchJobs.id, first?.id ?? ""));

    const [expired] = await leaseJobs(db, {
      workerId: "worker-c",
      limit: 1,
      now,
      leaseMs: 30_000,
    });
    const [leasedRow] = await db
      .select()
      .from(schema.searchJobs)
      .where(eq(schema.searchJobs.id, first?.id ?? ""));

    expect(expired?.id).toBe(first?.id);
    expect(expired?.leaseToken).not.toBe(first?.leaseToken);
    expect(leasedRow?.attempts).toBe(2);
  });

  it("completes metadata jobs, deduplicates videos, and selects display rows", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    const { runId } = await createMetadataRun(db, "@creator", now);
    const [job] = await leaseJobs(db, {
      workerId: "worker-a",
      limit: 1,
      now,
    });

    const result = await completeMetadataJob(db, {
      jobId: job?.id ?? "",
      leaseToken: job?.leaseToken ?? "",
      now,
      videos: [
        rawVideo("a", 1_000, "20260501"),
        rawVideo("b", 2_000, "20260502"),
        rawVideo("a", 5_000, "20260501"),
      ],
    });

    const videos = await db.select().from(schema.tiktokVideos);
    const runVideos = await db
      .select()
      .from(schema.searchRunVideos)
      .where(eq(schema.searchRunVideos.runId, runId));
    const [run] = await db
      .select()
      .from(schema.searchRuns)
      .where(eq(schema.searchRuns.id, runId));

    expect(result).toEqual({ totalDiscovered: 3, totalSelected: 2 });
    expect(videos).toHaveLength(2);
    expect(runVideos.map((row) => row.videoId).sort()).toEqual(["a", "b"]);
    expect(run).toMatchObject({
      status: "completed",
      totalDiscovered: 3,
      totalSelected: 2,
      metadataProcessed: 2,
    });
  });

  it("appends metadata videos while a scan is still running", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    const { runId } = await createMetadataRun(db, "@creator", now);
    const [job] = await leaseJobs(db, {
      workerId: "worker-a",
      limit: 1,
      now,
    });

    const result = await appendMetadataJobVideos(db, {
      jobId: job?.id ?? "",
      leaseToken: job?.leaseToken ?? "",
      now,
      videos: [rawVideo("a", 1_000, "20260501")],
    });

    const runVideos = await db
      .select()
      .from(schema.searchRunVideos)
      .where(eq(schema.searchRunVideos.runId, runId));
    const [run] = await db
      .select()
      .from(schema.searchRuns)
      .where(eq(schema.searchRuns.id, runId));
    const [jobRow] = await db
      .select()
      .from(schema.searchJobs)
      .where(eq(schema.searchJobs.id, job?.id ?? ""));

    expect(result).toEqual({ appended: 1, totalSelected: 1 });
    expect(runVideos).toHaveLength(1);
    expect(runVideos[0]).toMatchObject({
      videoId: "a",
      source: "recent",
      rank: 1,
      videoStatus: "idle",
    });
    expect(run).toMatchObject({
      status: "running",
      totalDiscovered: 1,
      totalSelected: 1,
      metadataProcessed: 1,
    });
    expect(jobRow?.status).toBe("leased");
  });

  it("replaces stale selected rows when a metadata job is retried", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    const { runId } = await createMetadataRun(db, "@creator", now);
    const [job] = await leaseJobs(db, { workerId: "worker-a", limit: 1, now });
    await completeMetadataJob(db, {
      jobId: job?.id ?? "",
      leaseToken: job?.leaseToken ?? "",
      now,
      videos: [
        rawVideo("a", 1_000, "20260501"),
        rawVideo("b", 2_000, "20260502"),
        rawVideo("stale", 3_000, "20260503"),
      ],
    });

    await db
      .update(schema.searchJobs)
      .set({
        status: "queued",
        leaseToken: null,
        leaseOwner: null,
        leasedUntil: null,
        completedAt: null,
      })
      .where(eq(schema.searchJobs.id, job?.id ?? ""));
    const [retry] = await leaseJobs(db, { workerId: "worker-b", limit: 1, now });
    await completeMetadataJob(db, {
      jobId: retry?.id ?? "",
      leaseToken: retry?.leaseToken ?? "",
      now,
      videos: [rawVideo("a", 1_000, "20260501"), rawVideo("b", 2_000, "20260502")],
    });

    const runVideos = await db
      .select()
      .from(schema.searchRunVideos)
      .where(eq(schema.searchRunVideos.runId, runId));

    expect(runVideos.map((row) => row.videoId).sort()).toEqual(["a", "b"]);
  });

  it("creates video download jobs idempotently from selected rows", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    const { runId } = await createMetadataRun(db, "@creator", now);
    const [job] = await leaseJobs(db, { workerId: "worker-a", limit: 1, now });
    await completeMetadataJob(db, {
      jobId: job?.id ?? "",
      leaseToken: job?.leaseToken ?? "",
      now,
      videos: [rawVideo("a", 1_000, "20260501"), rawVideo("b", 2_000, "20260502")],
    });

    expect(await createDownloadJobs(db, { runId, now })).toEqual({ created: 2 });
    expect(await createDownloadJobs(db, { runId, now })).toEqual({ created: 0 });

    const jobs = await db
      .select()
      .from(schema.searchJobs)
      .where(
        and(
          eq(schema.searchJobs.runId, runId),
          eq(schema.searchJobs.type, "video_download"),
        ),
      );
    const queuedRows = await db
      .select()
      .from(schema.searchRunVideos)
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          eq(schema.searchRunVideos.videoStatus, "queued"),
        ),
      );

    expect(jobs).toHaveLength(2);
    expect(queuedRows).toHaveLength(2);
  });

  it("requeues downloaded rows when the local file path is missing", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    const { runId } = await createMetadataRun(db, "@creator", now);
    const [job] = await leaseJobs(db, { workerId: "worker-a", limit: 1, now });
    await completeMetadataJob(db, {
      jobId: job?.id ?? "",
      leaseToken: job?.leaseToken ?? "",
      now,
      videos: [
        rawVideo("a", 1_000, "20260501"),
        rawVideo("b", 2_000, "20260502"),
        rawVideo("c", 3_000, "20260503"),
      ],
    });

    await db
      .update(schema.searchRunVideos)
      .set({ videoStatus: "downloaded", localPath: null })
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          eq(schema.searchRunVideos.videoId, "a"),
        ),
      );
    await db
      .update(schema.searchRunVideos)
      .set({ videoStatus: "downloaded", localPath: "public/tiktok-videos/c.mp4" })
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          eq(schema.searchRunVideos.videoId, "c"),
        ),
      );

    expect(await createDownloadJobs(db, { runId, now })).toEqual({ created: 2 });

    const queuedRows = await db
      .select()
      .from(schema.searchRunVideos)
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          eq(schema.searchRunVideos.videoStatus, "queued"),
        ),
      );

    expect(queuedRows.map((row) => row.videoId).sort()).toEqual(["a", "b"]);
  });

  it("creates one video download job from a Voir action", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    const { runId } = await createMetadataRun(db, "@creator", now);
    const [job] = await leaseJobs(db, { workerId: "worker-a", limit: 1, now });
    await completeMetadataJob(db, {
      jobId: job?.id ?? "",
      leaseToken: job?.leaseToken ?? "",
      now,
      videos: [rawVideo("a", 1_000, "20260501"), rawVideo("b", 2_000, "20260502")],
    });

    expect(await createVideoDownloadJob(db, { runId, videoId: "a", now })).toEqual({
      created: 1,
    });
    expect(await createVideoDownloadJob(db, { runId, videoId: "a", now })).toEqual({
      created: 0,
    });

    const jobs = await db
      .select()
      .from(schema.searchJobs)
      .where(
        and(
          eq(schema.searchJobs.runId, runId),
          eq(schema.searchJobs.type, "video_download"),
        ),
      );
    const queuedRows = await db
      .select()
      .from(schema.searchRunVideos)
      .where(
        and(
          eq(schema.searchRunVideos.runId, runId),
          eq(schema.searchRunVideos.videoStatus, "queued"),
        ),
      );

    expect(jobs).toHaveLength(1);
    expect(queuedRows.map((row) => row.videoId)).toEqual(["a"]);
  });

  it("does not lease unexpired jobs even when another expired job exists", async () => {
    const db = getDb();
    const now = new Date("2026-05-07T10:00:00.000Z");
    await createMetadataRun(db, "@creator", now);
    await createMetadataRun(db, "@other", now);
    const leased = await leaseJobs(db, {
      workerId: "worker-a",
      limit: 2,
      now,
      leaseMs: 30_000,
    });

    await db
      .update(schema.searchJobs)
      .set({ leasedUntil: now.getTime() - 1 })
      .where(eq(schema.searchJobs.id, leased[0]?.id ?? ""));

    const released = await leaseJobs(db, {
      workerId: "worker-b",
      limit: 2,
      now,
      leaseMs: 30_000,
    });
    const unexpired = await db
      .select()
      .from(schema.searchJobs)
      .where(lt(schema.searchJobs.leasedUntil, now.getTime()));

    expect(released.map((job) => job.id)).toEqual([leased[0]?.id]);
    expect(unexpired).toHaveLength(0);
  });
});

function rawVideo(id: string, viewCount: number, uploadDate: string) {
  return {
    id,
    uploader: "creator",
    webpage_url: `https://www.tiktok.com/@creator/video/${id}`,
    title: `Video ${id}`,
    description: `Video ${id} #tag`,
    upload_date: uploadDate,
    view_count: viewCount,
  };
}
