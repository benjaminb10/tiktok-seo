CREATE TABLE `search_runs` (
  `id` text PRIMARY KEY NOT NULL,
  `input` text NOT NULL,
  `normalized_url` text NOT NULL,
  `kind` text NOT NULL,
  `handle` text,
  `video_id` text,
  `status` text DEFAULT 'queued' NOT NULL,
  `total_discovered` integer DEFAULT 0 NOT NULL,
  `total_selected` integer DEFAULT 0 NOT NULL,
  `metadata_processed` integer DEFAULT 0 NOT NULL,
  `video_jobs_total` integer DEFAULT 0 NOT NULL,
  `video_jobs_completed` integer DEFAULT 0 NOT NULL,
  `video_jobs_failed` integer DEFAULT 0 NOT NULL,
  `error` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE INDEX `search_runs_status_idx` ON `search_runs` (`status`);
CREATE INDEX `search_runs_handle_idx` ON `search_runs` (`handle`);

CREATE TABLE `search_jobs` (
  `id` text PRIMARY KEY NOT NULL,
  `run_id` text NOT NULL,
  `type` text NOT NULL,
  `status` text DEFAULT 'queued' NOT NULL,
  `payload_json` text NOT NULL,
  `lease_token` text,
  `lease_owner` text,
  `leased_until` integer,
  `attempts` integer DEFAULT 0 NOT NULL,
  `error` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `completed_at` integer,
  FOREIGN KEY (`run_id`) REFERENCES `search_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `search_jobs_status_idx` ON `search_jobs` (`status`);
CREATE INDEX `search_jobs_run_idx` ON `search_jobs` (`run_id`);
CREATE INDEX `search_jobs_lease_idx` ON `search_jobs` (`status`, `leased_until`);

CREATE TABLE `tiktok_videos` (
  `id` text PRIMARY KEY NOT NULL,
  `handle` text,
  `webpage_url` text NOT NULL,
  `thumbnail_url` text,
  `title` text,
  `description` text,
  `published_at` text,
  `upload_date` text,
  `duration_seconds` integer,
  `view_count` integer,
  `like_count` integer,
  `favorite_count` integer,
  `repost_count` integer,
  `comment_count` integer,
  `tags_json` text DEFAULT '[]' NOT NULL,
  `audio_track` text,
  `audio_author` text,
  `transcript_text` text,
  `downloaded_local_path` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
CREATE UNIQUE INDEX `tiktok_videos_webpage_url_idx` ON `tiktok_videos` (`webpage_url`);
CREATE INDEX `tiktok_videos_published_idx` ON `tiktok_videos` (`published_at`);
CREATE INDEX `tiktok_videos_views_idx` ON `tiktok_videos` (`view_count`);

CREATE TABLE `search_run_videos` (
  `run_id` text NOT NULL,
  `video_id` text NOT NULL,
  `source` text NOT NULL,
  `rank` integer NOT NULL,
  `video_status` text DEFAULT 'idle' NOT NULL,
  `local_path` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  PRIMARY KEY (`run_id`, `video_id`),
  FOREIGN KEY (`run_id`) REFERENCES `search_runs`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`video_id`) REFERENCES `tiktok_videos`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX `search_run_videos_run_rank_idx` ON `search_run_videos` (`run_id`, `rank`);
CREATE INDEX `search_run_videos_video_status_idx` ON `search_run_videos` (`video_status`);
