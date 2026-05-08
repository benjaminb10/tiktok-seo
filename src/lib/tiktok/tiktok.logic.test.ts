import { describe, expect, it } from "vitest";
import {
  normalizeTikTokInput,
  sanitizeTikTokInfo,
  selectDisplayVideos,
  type SanitizedTikTokVideo,
} from "./tiktok.logic";

describe("normalizeTikTokInput", () => {
  it("normalizes a handle with or without @", () => {
    expect(normalizeTikTokInput("@babys_077888")).toEqual({
      kind: "profile",
      handle: "babys_077888",
      url: "https://www.tiktok.com/@babys_077888",
    });

    expect(normalizeTikTokInput("babys_077888")).toEqual({
      kind: "profile",
      handle: "babys_077888",
      url: "https://www.tiktok.com/@babys_077888",
    });
  });

  it("normalizes a full TikTok video URL", () => {
    expect(
      normalizeTikTokInput(
        "https://www.tiktok.com/@babys_077888/video/7625134473557904670",
      ),
    ).toEqual({
      kind: "video",
      handle: "babys_077888",
      videoId: "7625134473557904670",
      url: "https://www.tiktok.com/@babys_077888/video/7625134473557904670",
    });
  });

  it("rejects ambiguous or unsupported TikTok URLs", () => {
    expect(() => normalizeTikTokInput("https://vm.tiktok.com/ZMabc/")).toThrow(
      /non supportee|ambigu/i,
    );
    expect(() => normalizeTikTokInput("https://www.tiktok.com/tag/love")).toThrow(
      /non supportee|ambigu/i,
    );
  });
});

describe("sanitizeTikTokInfo", () => {
  it("keeps useful metadata and strips sensitive media fields", () => {
    const sanitized = sanitizeTikTokInfo({
      id: "7625134473557904670",
      uploader: "babys_077888",
      webpage_url:
        "https://www.tiktok.com/@babys_077888/video/7625134473557904670",
      title: "love story",
      description: "Love #love #lovestory #viral",
      timestamp: 1775364988,
      upload_date: "20260405",
      duration: 58,
      view_count: 56800,
      like_count: 2349,
      favorite_count: 120,
      repost_count: 55,
      comment_count: 40,
      track: "son original",
      artist: "Akram.zk",
      formats: [{ url: "https://signed-video.example", cookies: "secret" }],
      url: "https://signed-video.example",
      cookies: "secret",
    });

    expect(sanitized).toMatchObject({
      id: "7625134473557904670",
      handle: "babys_077888",
      webpageUrl:
        "https://www.tiktok.com/@babys_077888/video/7625134473557904670",
      viewCount: 56800,
      likeCount: 2349,
      favoriteCount: 120,
      repostCount: 55,
      commentCount: 40,
      durationSeconds: 58,
      audioTrack: "son original",
      audioAuthor: "Akram.zk",
      tags: ["love", "lovestory", "viral"],
    });
    expect(sanitized.publishedAt).toBe("2026-04-05T04:56:28.000Z");
    expect(sanitized.transcriptText).toBeNull();
    expect((sanitized as Record<string, unknown>).formats).toBeUndefined();
    expect((sanitized as Record<string, unknown>).url).toBeUndefined();
    expect((sanitized as Record<string, unknown>).cookies).toBeUndefined();
  });

  it("extracts transcript text only when TikTok metadata already contains it", () => {
    const sanitized = sanitizeTikTokInfo({
      id: "1",
      uploader: "creator",
      webpage_url: "https://www.tiktok.com/@creator/video/1",
      subtitles: {
        en: [
          {
            ext: "json3",
            data: {
              events: [
                { segs: [{ utf8: "hello " }, { utf8: "world" }] },
                { segs: [{ utf8: "\n" }] },
              ],
            },
          },
        ],
      },
    });

    expect(sanitized.transcriptText).toBe("hello world");
  });
});

describe("selectDisplayVideos", () => {
  it("returns 50 newest and 50 most viewed without duplicate rows", () => {
    const videos = Array.from({ length: 120 }, (_, index) =>
      video({
        id: `video-${index.toString().padStart(3, "0")}`,
        publishedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
        viewCount: index < 20 ? 10_000_000 - index : index,
      }),
    );

    const selected = selectDisplayVideos(videos);
    const uniqueIds = new Set(selected.map((item) => item.videoId));

    expect(selected).toHaveLength(100);
    expect(uniqueIds.size).toBe(100);
    expect(selected.slice(0, 50).map((item) => item.videoId)).toEqual(
      Array.from({ length: 50 }, (_, offset) =>
        `video-${(119 - offset).toString().padStart(3, "0")}`,
      ),
    );
    expect(selected.some((item) => item.source === "popular")).toBe(true);
    expect(selected.some((item) => item.source === "recent_popular")).toBe(true);
  });
});

function video(
  overrides: Partial<SanitizedTikTokVideo>,
): SanitizedTikTokVideo {
  return {
    id: "video",
    handle: "creator",
    webpageUrl: "https://www.tiktok.com/@creator/video/video",
    title: null,
    description: null,
    publishedAt: null,
    uploadDate: null,
    durationSeconds: null,
    viewCount: null,
    likeCount: null,
    favoriteCount: null,
    repostCount: null,
    commentCount: null,
    tags: [],
    audioTrack: null,
    audioAuthor: null,
    transcriptText: null,
    ...overrides,
  };
}
