import { and, eq, sql } from "drizzle-orm";
import * as schema from "#/db/schema";
import { parseStringArrayJson } from "./tiktok.payload";
import type { TikTokDb } from "./tiktok.db.server";
import type {
  RunVideoRow,
  SanitizedTikTokVideo,
  SelectedTikTokVideo,
} from "./tiktok.types";

export async function getRunVideos(
  database: TikTokDb,
  runId: string,
): Promise<RunVideoRow[]> {
  const rows = await database
    .select({
      runVideo: schema.searchRunVideos,
      video: schema.tiktokVideos,
    })
    .from(schema.searchRunVideos)
    .innerJoin(
      schema.tiktokVideos,
      eq(schema.searchRunVideos.videoId, schema.tiktokVideos.id),
    )
    .where(eq(schema.searchRunVideos.runId, runId))
    .orderBy(schema.searchRunVideos.rank);

  return rows.map(({ runVideo, video }) => ({
    id: video.id,
    handle: video.handle,
    webpageUrl: video.webpageUrl,
    title: video.title,
    description: video.description,
    publishedAt: video.publishedAt,
    uploadDate: video.uploadDate,
    durationSeconds: video.durationSeconds,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    favoriteCount: video.favoriteCount,
    repostCount: video.repostCount,
    commentCount: video.commentCount,
    tags: parseStringArrayJson(video.tagsJson),
    audioTrack: video.audioTrack,
    audioAuthor: video.audioAuthor,
    transcriptText: video.transcriptText,
    source: runVideo.source,
    rank: runVideo.rank,
    videoStatus: runVideo.videoStatus,
    localPath: runVideo.localPath,
  }));
}

export async function upsertVideo(
  database: TikTokDb,
  video: SanitizedTikTokVideo,
  timestamp: number,
) {
  await database
    .insert(schema.tiktokVideos)
    .values({
      id: video.id,
      handle: video.handle,
      webpageUrl: video.webpageUrl,
      title: video.title,
      description: video.description,
      publishedAt: video.publishedAt,
      uploadDate: video.uploadDate,
      durationSeconds: video.durationSeconds,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      favoriteCount: video.favoriteCount,
      repostCount: video.repostCount,
      commentCount: video.commentCount,
      tagsJson: JSON.stringify(video.tags),
      audioTrack: video.audioTrack,
      audioAuthor: video.audioAuthor,
      transcriptText: video.transcriptText,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoUpdate({
      target: schema.tiktokVideos.id,
      set: {
        handle: video.handle,
        webpageUrl: video.webpageUrl,
        title: video.title,
        description: video.description,
        publishedAt: video.publishedAt,
        uploadDate: video.uploadDate,
        durationSeconds: video.durationSeconds,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        favoriteCount: video.favoriteCount,
        repostCount: video.repostCount,
        commentCount: video.commentCount,
        tagsJson: JSON.stringify(video.tags),
        audioTrack: video.audioTrack,
        audioAuthor: video.audioAuthor,
        transcriptText: video.transcriptText,
        updatedAt: timestamp,
      },
    });
}

export async function replaceRunVideos(
  database: TikTokDb,
  runId: string,
  selected: SelectedTikTokVideo[],
  timestamp: number,
) {
  await database
    .delete(schema.searchRunVideos)
    .where(eq(schema.searchRunVideos.runId, runId));

  for (const item of selected) {
    await database
      .insert(schema.searchRunVideos)
      .values({
        runId,
        videoId: item.videoId,
        source: item.source,
        rank: item.rank,
        videoStatus: "idle",
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: [schema.searchRunVideos.runId, schema.searchRunVideos.videoId],
        set: {
          source: item.source,
          rank: item.rank,
          updatedAt: timestamp,
        },
      });
  }
}

export async function appendRunVideo(
  database: TikTokDb,
  input: {
    runId: string;
    videoId: string;
    rank: number;
    timestamp: number;
  },
) {
  await database
    .insert(schema.searchRunVideos)
    .values({
      runId: input.runId,
      videoId: input.videoId,
      source: "recent",
      rank: input.rank,
      videoStatus: "idle",
      createdAt: input.timestamp,
      updatedAt: input.timestamp,
    })
    .onConflictDoNothing();
}

export async function markVideoDownloading(
  database: TikTokDb,
  input: { runId: string; videoId: string; timestamp: number },
) {
  await database
    .update(schema.searchRunVideos)
    .set({ videoStatus: "downloading", updatedAt: input.timestamp })
    .where(
      and(
        eq(schema.searchRunVideos.runId, input.runId),
        eq(schema.searchRunVideos.videoId, input.videoId),
      ),
    );
}

export async function countRunVideos(
  database: TikTokDb,
  runId: string,
): Promise<number> {
  const [row] = await database
    .select({ count: sql<number>`count(*)` })
    .from(schema.searchRunVideos)
    .where(eq(schema.searchRunVideos.runId, runId));

  return Number(row?.count ?? 0);
}
