import type { RunDetails, RunVideoRow } from "./tiktok.types";

type VideoStatus = RunDetails["videos"][number]["videoStatus"];

export type RunStatusView = {
  title: string;
  description: string;
  isBusy: boolean;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
};

export function getRunStatusView(
  details: RunDetails | null,
  requestedRunId?: string | null,
): RunStatusView {
  if (!details) {
    if (requestedRunId) {
      return {
        title: "Loading results",
        description: "Fetching analyzed videos.",
        isBusy: true,
      };
    }

    return {
      title: "Ready",
      description: "Paste a username or TikTok link to get started.",
      isBusy: false,
    };
  }

  if (details.run.status === "queued") {
    return {
      title: "Analysis in progress",
      description: "Preparing the video list.",
      isBusy: true,
    };
  }

  if (details.run.status === "running") {
    const current = details.run.metadataProcessed;
    const total = details.run.totalSelected || details.run.totalDiscovered;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    if (details.videos.length > 0) {
      return {
        title: "Analysis in progress",
        description: `Fetching videos (${current}/${total})`,
        isBusy: true,
        progress: { current, total, percentage },
      };
    }

    return {
      title: "Analysis in progress",
      description: "Videos are loading automatically.",
      isBusy: true,
    };
  }

  if (hasPendingVideoWork(details)) {
    return {
      title: "Fetching in progress",
      description: "Videos are loading. The table updates automatically.",
      isBusy: true,
    };
  }

  if (details.run.status === "failed") {
    return {
      title: "Analysis failed",
      description: "Unable to analyze this account at the moment.",
      isBusy: false,
    };
  }

  if (details.run.status === "cancelled") {
    return {
      title: "Analysis cancelled",
      description: "The analysis was stopped.",
      isBusy: false,
    };
  }

  return {
    title: `${details.videos.length} videos found`,
    description: "",
    isBusy: false,
  };
}

export function shouldPollRunDetails(
  details: RunDetails | null,
  requestedRunId?: string | null,
): boolean {
  if (!requestedRunId) return false;
  if (!details) return true;
  if (hasPendingVideoWork(details)) return true;
  return details.run.status === "queued" || details.run.status === "running";
}

export function hasPendingVideoWork(details: RunDetails | null): boolean {
  return details?.videos.some((video) =>
    video.videoStatus === "queued" || video.videoStatus === "downloading"
  ) ?? false;
}

export function getVideoStatusLabel(
  status: VideoStatus,
  hasPlayableFile = true,
): string {
  if (status === "downloaded" && !hasPlayableFile) return "To fetch";

  switch (status) {
    case "idle":
      return "Available";
    case "queued":
      return "Queued";
    case "downloading":
      return "Downloading";
    case "downloaded":
      return "Downloaded";
    case "failed":
      return "Failed";
  }
}

export function getTikTokEmbedUrl(
  video: Pick<RunVideoRow, "id" | "webpageUrl">,
): string | null {
  const match = video.webpageUrl.match(/\/video\/(\d+)/);
  const videoId = match?.[1] ?? (/^\d+$/.test(video.id) ? video.id : null);
  if (!videoId) return null;
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

export function getLocalVideoUrl(
  video: Pick<RunVideoRow, "id" | "localPath" | "videoStatus">,
): string | null {
  if (video.videoStatus !== "downloaded" || !video.localPath) return null;

  const normalizedPath = video.localPath.replaceAll("\\", "/");
  const publicMarker = "/public/";
  const publicIndex = normalizedPath.lastIndexOf(publicMarker);
  if (publicIndex >= 0) {
    return encodePublicPath(
      `/${normalizedPath.slice(publicIndex + publicMarker.length)}`,
    );
  }

  if (normalizedPath.startsWith("public/")) {
    return encodePublicPath(`/${normalizedPath.slice("public/".length)}`);
  }

  const videosMarker = "tiktok-videos/";
  const videosIndex = normalizedPath.lastIndexOf(videosMarker);
  if (videosIndex >= 0) {
    return encodePublicPath(`/${normalizedPath.slice(videosIndex)}`);
  }

  return null;
}

function encodePublicPath(value: string): string {
  return value
    .split("/")
    .map((segment, index) => (index === 0 ? "" : encodeURIComponent(segment)))
    .join("/");
}
