import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const searchRuns = sqliteTable(
  "search_runs",
  {
    id: text("id").primaryKey(),
    input: text("input").notNull(),
    normalizedUrl: text("normalized_url").notNull(),
    kind: text("kind", { enum: ["profile", "video"] }).notNull(),
    handle: text("handle"),
    videoId: text("video_id"),
    status: text("status", {
      enum: ["queued", "running", "completed", "failed", "cancelled"],
    })
      .notNull()
      .default("queued"),
    totalDiscovered: integer("total_discovered").notNull().default(0),
    totalSelected: integer("total_selected").notNull().default(0),
    metadataProcessed: integer("metadata_processed").notNull().default(0),
    videoJobsTotal: integer("video_jobs_total").notNull().default(0),
    videoJobsCompleted: integer("video_jobs_completed").notNull().default(0),
    videoJobsFailed: integer("video_jobs_failed").notNull().default(0),
    error: text("error"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("search_runs_status_idx").on(table.status),
    index("search_runs_handle_idx").on(table.handle),
  ],
);

export const searchJobs = sqliteTable(
  "search_jobs",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => searchRuns.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["metadata_scan", "video_download"] }).notNull(),
    status: text("status", {
      enum: ["queued", "leased", "completed", "failed"],
    })
      .notNull()
      .default("queued"),
    payloadJson: text("payload_json").notNull(),
    leaseToken: text("lease_token"),
    leaseOwner: text("lease_owner"),
    leasedUntil: integer("leased_until"),
    attempts: integer("attempts").notNull().default(0),
    error: text("error"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
    completedAt: integer("completed_at"),
  },
  (table) => [
    index("search_jobs_status_idx").on(table.status),
    index("search_jobs_run_idx").on(table.runId),
    index("search_jobs_lease_idx").on(table.status, table.leasedUntil),
  ],
);

export const tiktokVideos = sqliteTable(
  "tiktok_videos",
  {
    id: text("id").primaryKey(),
    handle: text("handle"),
    webpageUrl: text("webpage_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    title: text("title"),
    description: text("description"),
    publishedAt: text("published_at"),
    uploadDate: text("upload_date"),
    durationSeconds: integer("duration_seconds"),
    viewCount: integer("view_count"),
    likeCount: integer("like_count"),
    repostCount: integer("repost_count"),
    commentCount: integer("comment_count"),
    tagsJson: text("tags_json").notNull().default("[]"),
    audioTrack: text("audio_track"),
    audioAuthor: text("audio_author"),
    transcriptText: text("transcript_text"),
    downloadedLocalPath: text("downloaded_local_path"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("tiktok_videos_webpage_url_idx").on(table.webpageUrl),
    index("tiktok_videos_published_idx").on(table.publishedAt),
    index("tiktok_videos_views_idx").on(table.viewCount),
  ],
);

export const searchRunVideos = sqliteTable(
  "search_run_videos",
  {
    runId: text("run_id")
      .notNull()
      .references(() => searchRuns.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => tiktokVideos.id, { onDelete: "cascade" }),
    source: text("source", {
      enum: ["recent", "popular", "recent_popular"],
    }).notNull(),
    rank: integer("rank").notNull(),
    videoStatus: text("video_status", {
      enum: ["idle", "queued", "downloading", "downloaded", "failed"],
    })
      .notNull()
      .default("idle"),
    localPath: text("local_path"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.runId, table.videoId] }),
    index("search_run_videos_run_rank_idx").on(table.runId, table.rank),
    index("search_run_videos_video_status_idx").on(table.videoStatus),
  ],
);

export const searchRunsRelations = relations(searchRuns, ({ many }) => ({
  jobs: many(searchJobs),
  videos: many(searchRunVideos),
}));

export const searchJobsRelations = relations(searchJobs, ({ one }) => ({
  run: one(searchRuns, {
    fields: [searchJobs.runId],
    references: [searchRuns.id],
  }),
}));

export const tiktokVideosRelations = relations(tiktokVideos, ({ many }) => ({
  runs: many(searchRunVideos),
}));

export const searchRunVideosRelations = relations(
  searchRunVideos,
  ({ one }) => ({
    run: one(searchRuns, {
      fields: [searchRunVideos.runId],
      references: [searchRuns.id],
    }),
    video: one(tiktokVideos, {
      fields: [searchRunVideos.videoId],
      references: [tiktokVideos.id],
    }),
  }),
);
