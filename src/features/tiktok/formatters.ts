import type { RunVideoRow } from "#/lib/tiktok/tiktok.types";

export function formatNumber(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDuration(value: number | null): string {
  if (value == null) return "-";
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function engagementRate(video: RunVideoRow): number | null {
  if (!video.viewCount) return null;
  const interactions =
    (video.likeCount ?? 0) + (video.commentCount ?? 0) + (video.repostCount ?? 0);
  return interactions / video.viewCount;
}

export function formatPercent(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}
