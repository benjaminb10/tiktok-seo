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

// Use tikwm.com API to get video info (reliable third-party service)
async function getVideoFromTikwm(url: string): Promise<{
  downloadUrl: string | null;
  thumbnail: string | null;
  description: string | null;
  author: string | null;
}> {
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("TikWM API request failed");
    }

    const data = await response.json();

    if (data.code !== 0 || !data.data) {
      throw new Error(data.msg || "Failed to get video data");
    }

    const videoData = data.data;

    // Prefer HD version, fallback to regular play URL
    const downloadUrl = videoData.hdplay || videoData.play;

    return {
      downloadUrl: downloadUrl || null,
      thumbnail: videoData.cover || videoData.origin_cover || null,
      description: videoData.title || null,
      author: videoData.author?.unique_id || null,
    };
  } catch (error) {
    console.error("TikWM API error:", error);
    return { downloadUrl: null, thumbnail: null, description: null, author: null };
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

          // Get video data from TikWM API
          const videoData = await getVideoFromTikwm(resolvedUrl);

          if (!videoData.downloadUrl) {
            return Response.json(
              {
                error: "Could not extract video download URL. The video might be private or unavailable.",
                fallbackUrl: resolvedUrl,
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
