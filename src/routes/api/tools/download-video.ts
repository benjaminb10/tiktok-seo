import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const requestSchema = z.object({
  url: z.string().url(),
});

// Extract video ID from TikTok URL
function extractVideoId(url: string): string | null {
  const videoMatch = url.match(/video\/(\d+)/);
  if (videoMatch) return videoMatch[1];
  return null;
}

// Resolve short URLs (vm.tiktok.com, vt.tiktok.com)
async function resolveShortUrl(url: string): Promise<string> {
  if (!url.includes("vm.tiktok.com") && !url.includes("vt.tiktok.com") && !url.includes("/t/")) {
    return url;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return response.url;
  } catch {
    return url;
  }
}

// Get video data using TikWM API
async function getVideoData(videoId: string, originalUrl: string): Promise<{
  downloadUrl: string | null;
  thumbnail: string | null;
  description: string | null;
  author: string | null;
  error?: string;
}> {
  try {
    const formData = new URLSearchParams();
    formData.append("url", originalUrl);
    formData.append("hd", "1");

    console.log("[TikWM] Fetching video data for:", originalUrl);

    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: formData.toString(),
    });

    console.log("[TikWM] Response status:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("[TikWM] Error response:", text);
      return { downloadUrl: null, thumbnail: null, description: null, author: null, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    console.log("[TikWM] Response code:", data.code, "msg:", data.msg);

    if (data.code === 0 && data.data) {
      const videoData = data.data;
      return {
        downloadUrl: videoData.hdplay || videoData.play || null,
        thumbnail: videoData.cover || videoData.origin_cover || null,
        description: videoData.title || null,
        author: videoData.author?.unique_id || null,
      };
    }

    return { downloadUrl: null, thumbnail: null, description: null, author: null, error: data.msg || "Unknown error" };
  } catch (error) {
    console.error("[TikWM] Exception:", error);
    return { downloadUrl: null, thumbnail: null, description: null, author: null, error: String(error) };
  }
}

export const Route = createFileRoute("/api/tools/download-video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { url } = requestSchema.parse(body);

          // Resolve short URLs
          const resolvedUrl = await resolveShortUrl(url);
          const videoId = extractVideoId(resolvedUrl);

          if (!videoId) {
            return Response.json(
              { error: "Could not extract video ID from URL. Please make sure it's a valid TikTok video link." },
              { status: 400 }
            );
          }

          // Get video data from external APIs
          const videoData = await getVideoData(videoId, resolvedUrl);

          if (!videoData.downloadUrl) {
            return Response.json(
              {
                error: `Could not extract video download URL. ${videoData.error || "The video might be private or unavailable."}`,
                fallbackUrl: resolvedUrl,
                debug: { videoId, resolvedUrl, apiError: videoData.error },
              },
              { status: 400 }
            );
          }

          return Response.json({
            success: true,
            videoId,
            thumbnail: videoData.thumbnail,
            description: videoData.description,
            author: videoData.author,
            downloadUrl: videoData.downloadUrl,
          });
        } catch (error) {
          console.error("Download video error:", error);

          if (error instanceof z.ZodError) {
            return Response.json(
              { error: "Invalid URL format. Please enter a valid TikTok video URL." },
              { status: 400 }
            );
          }

          return Response.json(
            { error: "Failed to process video. Please try again later." },
            { status: 500 }
          );
        }
      },
    },
  },
});
