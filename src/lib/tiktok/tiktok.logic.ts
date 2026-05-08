import type {
  SanitizedTikTokVideo,
  SelectedTikTokVideo,
  TikTokInput,
} from "./tiktok.types";

export type {
  SanitizedTikTokVideo,
  SelectedTikTokVideo,
  TikTokInput,
} from "./tiktok.types";

export function normalizeTikTokInput(input: string): TikTokInput {
  const value = input.trim();
  if (!value) {
    throw new Error("Entree TikTok vide.");
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return normalizeTikTokUrl(value);
  }

  const handle = value.startsWith("@") ? value.slice(1) : value;
  assertValidHandle(handle);

  return {
    kind: "profile",
    handle,
    url: `https://www.tiktok.com/@${handle}`,
  };
}

export function sanitizeTikTokInfo(info: unknown): SanitizedTikTokVideo {
  const record = toRecord(info);
  const id = readString(record, "id");
  if (!id) {
    throw new Error("Metadonnees TikTok invalides: id manquant.");
  }

  const webpageUrl =
    readString(record, "webpage_url") ??
    readString(record, "original_url") ??
    buildFallbackVideoUrl(record, id);

  return {
    id,
    handle:
      readString(record, "uploader") ??
      readString(record, "playlist") ??
      readHandleFromUrl(webpageUrl),
    webpageUrl,
    title: readString(record, "title"),
    description: readString(record, "description"),
    publishedAt: readPublishedAt(record),
    uploadDate: readString(record, "upload_date"),
    durationSeconds: readNumber(record, "duration"),
    viewCount: readNumber(record, "view_count"),
    likeCount: readNumber(record, "like_count"),
    favoriteCount:
      readNumber(record, "favorite_count") ?? readNumber(record, "digg_count"),
    repostCount: readNumber(record, "repost_count"),
    commentCount: readNumber(record, "comment_count"),
    tags: readTags(record),
    audioTrack: readString(record, "track"),
    audioAuthor: readAudioAuthor(record),
    transcriptText: readTranscript(record),
  };
}

export function selectDisplayVideos(
  videos: SanitizedTikTokVideo[],
): SelectedTikTokVideo[] {
  const selected = new Map<
    string,
    { videoId: string; source: SelectedTikTokVideo["source"] }
  >();

  const recent = [...videos]
    .sort((left, right) => {
      return dateScore(right.publishedAt) - dateScore(left.publishedAt);
    })
    .slice(0, 50);

  for (const item of recent) {
    selected.set(item.id, { videoId: item.id, source: "recent" });
  }

  const popular = [...videos].sort((left, right) => {
    const byViews = countScore(right.viewCount) - countScore(left.viewCount);
    if (byViews !== 0) return byViews;
    return dateScore(right.publishedAt) - dateScore(left.publishedAt);
  });

  for (const item of popular) {
    const existing = selected.get(item.id);
    if (existing) {
      existing.source = "recent_popular";
      continue;
    }

    if (selected.size >= 100) break;
    selected.set(item.id, { videoId: item.id, source: "popular" });
  }

  return Array.from(selected.values()).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

function normalizeTikTokUrl(input: string): TikTokInput {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("URL TikTok non supportee ou ambiguë.");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "vm.tiktok.com" || hostname === "vt.tiktok.com") {
    throw new Error("URL TikTok courte non supportee ou ambiguë.");
  }

  if (hostname !== "www.tiktok.com" && hostname !== "m.tiktok.com") {
    throw new Error("URL TikTok non supportee ou ambiguë.");
  }

  const match = url.pathname.match(/^\/@([^/]+)(?:\/video\/(\d+))?\/?$/);
  if (!match) {
    throw new Error("URL TikTok non supportee ou ambiguë.");
  }

  const handle = decodeURIComponent(match[1] ?? "");
  assertValidHandle(handle);

  const videoId = match[2];
  if (videoId) {
    return {
      kind: "video",
      handle,
      videoId,
      url: `https://www.tiktok.com/@${handle}/video/${videoId}`,
    };
  }

  return {
    kind: "profile",
    handle,
    url: `https://www.tiktok.com/@${handle}`,
  };
}

function assertValidHandle(handle: string): void {
  if (!/^[A-Za-z0-9._]{2,24}$/.test(handle)) {
    throw new Error("Pseudo TikTok non supporte ou ambigu.");
  }
}

function toRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Metadonnees TikTok invalides.");
  }
  return value as Record<string, unknown>;
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function readPublishedAt(record: Record<string, unknown>): string | null {
  const timestamp = readNumber(record, "timestamp");
  if (timestamp != null) {
    return new Date(timestamp * 1000).toISOString();
  }

  const uploadDate = readString(record, "upload_date");
  if (!uploadDate || !/^\d{8}$/.test(uploadDate)) return null;

  const year = Number(uploadDate.slice(0, 4));
  const month = Number(uploadDate.slice(4, 6)) - 1;
  const day = Number(uploadDate.slice(6, 8));
  return new Date(Date.UTC(year, month, day)).toISOString();
}

function readTags(record: Record<string, unknown>): string[] {
  const explicitTags = record.tags;
  if (Array.isArray(explicitTags)) {
    return uniqueTags(explicitTags.filter((tag) => typeof tag === "string"));
  }

  const description = readString(record, "description") ?? "";
  const matches = description.matchAll(/#([\p{L}\p{N}_]+)/gu);
  return uniqueTags(Array.from(matches, (match) => match[1] ?? ""));
}

function uniqueTags(tags: string[]): string[] {
  const seen = new Set<string>();
  for (const tag of tags) {
    const normalized = tag.trim().replace(/^#/, "").toLowerCase();
    if (normalized) seen.add(normalized);
  }
  return Array.from(seen);
}

function readAudioAuthor(record: Record<string, unknown>): string | null {
  const artist = readString(record, "artist");
  if (artist) return artist;

  const artists = record.artists;
  if (!Array.isArray(artists)) return null;

  const firstArtist = artists.find((item) => typeof item === "string");
  return typeof firstArtist === "string" ? firstArtist : null;
}

function readTranscript(record: Record<string, unknown>): string | null {
  const direct = readString(record, "transcript");
  if (direct) return normalizeTranscript(direct);

  return (
    readTranscriptFromCaptions(record.subtitles) ??
    readTranscriptFromCaptions(record.automatic_captions)
  );
}

function readTranscriptFromCaptions(captions: unknown): string | null {
  if (!captions || typeof captions !== "object" || Array.isArray(captions)) {
    return null;
  }

  const parts: string[] = [];
  for (const entries of Object.values(captions)) {
    if (!Array.isArray(entries)) continue;

    for (const entry of entries) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const record = entry as Record<string, unknown>;
      parts.push(...readTranscriptParts(record.data));
      parts.push(...readTranscriptParts(record.text));
      parts.push(...readTranscriptParts(record.transcript));
    }
  }

  return normalizeTranscript(parts.join(" "));
}

function readTranscriptParts(value: unknown): string[] {
  if (typeof value === "string") {
    const parsed = tryParseJson(value);
    if (parsed !== value) return readTranscriptParts(parsed);
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => readTranscriptParts(item));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const parts: string[] = [];

  const events = record.events;
  if (Array.isArray(events)) {
    for (const event of events) {
      if (!event || typeof event !== "object" || Array.isArray(event)) {
        continue;
      }
      const segments = (event as Record<string, unknown>).segs;
      if (!Array.isArray(segments)) continue;

      for (const segment of segments) {
        if (!segment || typeof segment !== "object" || Array.isArray(segment)) {
          continue;
        }
        const text = (segment as Record<string, unknown>).utf8;
        if (typeof text === "string") parts.push(text);
      }
    }
  }

  for (const key of ["body", "text", "transcript"]) {
    const valueForKey = record[key];
    if (typeof valueForKey === "string") parts.push(valueForKey);
  }

  return parts;
}

function tryParseJson(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function normalizeTranscript(value: string): string | null {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized : null;
}

function buildFallbackVideoUrl(
  record: Record<string, unknown>,
  id: string,
): string {
  const handle = readString(record, "uploader") ?? readString(record, "playlist");
  if (handle) return `https://www.tiktok.com/@${handle}/video/${id}`;
  return `https://www.tiktok.com/video/${id}`;
}

function readHandleFromUrl(url: string): string | null {
  const match = url.match(/tiktok\.com\/@([^/]+)/);
  return match ? decodeURIComponent(match[1] ?? "") : null;
}

function dateScore(value: string | null): number {
  if (!value) return 0;
  const score = Date.parse(value);
  return Number.isFinite(score) ? score : 0;
}

function countScore(value: number | null): number {
  return value ?? 0;
}
