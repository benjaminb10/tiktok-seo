export type TikTokInput =
  | {
      kind: "profile";
      handle: string;
      url: string;
    }
  | {
      kind: "video";
      handle: string;
      videoId: string;
      url: string;
    };

export type SanitizedTikTokVideo = {
  id: string;
  handle: string | null;
  webpageUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  publishedAt: string | null;
  uploadDate: string | null;
  durationSeconds: number | null;
  viewCount: number | null;
  likeCount: number | null;
  repostCount: number | null;
  commentCount: number | null;
  tags: string[];
  audioTrack: string | null;
  audioAuthor: string | null;
  transcriptText: string | null;
};

export type SelectedTikTokVideo = {
  videoId: string;
  source: RunVideoSource;
  rank: number;
};

export type RunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type JobStatus = "queued" | "leased" | "completed" | "failed";

export type JobType = "metadata_scan" | "video_download";

export type RunVideoSource = "recent" | "popular" | "recent_popular";

export type RunVideoStatus =
  | "idle"
  | "queued"
  | "downloading"
  | "downloaded"
  | "failed";

export type LeasedJob = {
  id: string;
  runId: string;
  type: JobType;
  payload: Record<string, unknown>;
  leaseToken: string;
  leasedUntil: number;
};

export type RunVideoRow = SanitizedTikTokVideo & {
  source: RunVideoSource;
  rank: number;
  videoStatus: RunVideoStatus;
  localPath: string | null;
};

export type RunDetails = {
  run: {
    id: string;
    input: string;
    normalizedUrl: string;
    kind: "profile" | "video";
    handle: string | null;
    videoId: string | null;
    avatarUrl: string | null;
    status: RunStatus;
    totalDiscovered: number;
    totalSelected: number;
    metadataProcessed: number;
    videoJobsTotal: number;
    videoJobsCompleted: number;
    videoJobsFailed: number;
    error: string | null;
    createdAt: number;
    updatedAt: number;
  };
  videos: RunVideoRow[];
};
