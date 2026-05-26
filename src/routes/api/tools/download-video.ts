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

// Get video data using TikTok's web API
async function getVideoData(videoId: string, originalUrl: string): Promise<{
  downloadUrl: string | null;
  thumbnail: string | null;
  description: string | null;
  author: string | null;
}> {
  // Method 1: Try TikTok's internal API
  try {
    const apiUrl = `https://api22-normal-c-alisg.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "com.zhiliaoapp.musically/2022600030 (Linux; U; Android 12; en_US; Pixel 6; Build/SD1A.210817.023;tt-ok/3.12.13.1)",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const aweme = data?.aweme_list?.[0];
      if (aweme) {
        const video = aweme.video;
        // Get the best quality play URL
        const playUrl = video?.play_addr?.url_list?.[0] || video?.download_addr?.url_list?.[0];

        return {
          downloadUrl: playUrl || null,
          thumbnail: video?.cover?.url_list?.[0] || video?.origin_cover?.url_list?.[0] || null,
          description: aweme.desc || null,
          author: aweme.author?.unique_id || null,
        };
      }
    }
  } catch (error) {
    console.error("TikTok API v1 error:", error);
  }

  // Method 2: Try TikTok web page scraping
  try {
    const pageUrl = `https://www.tiktok.com/@placeholder/video/${videoId}`;
    const response = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    if (response.ok) {
      const html = await response.text();

      // Try to find video URL in various script tags
      const patterns = [
        /"playAddr"\s*:\s*"([^"]+)"/,
        /"downloadAddr"\s*:\s*"([^"]+)"/,
        /playAddr.*?"(https[^"]+)"/,
        /"play"\s*:\s*"([^"]+)"/,
      ];

      let videoUrl: string | null = null;
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          videoUrl = match[1].replace(/\\u002F/g, "/").replace(/\\/g, "");
          break;
        }
      }

      // Extract thumbnail
      const thumbMatch = html.match(/"cover"\s*:\s*"([^"]+)"/) ||
                         html.match(/property="og:image"[^>]*content="([^"]+)"/);
      const thumbnail = thumbMatch ? thumbMatch[1].replace(/\\u002F/g, "/") : null;

      // Extract description
      const descMatch = html.match(/property="og:description"[^>]*content="([^"]+)"/);
      const description = descMatch ? descMatch[1] : null;

      if (videoUrl) {
        return { downloadUrl: videoUrl, thumbnail, description, author: null };
      }
    }
  } catch (error) {
    console.error("TikTok page scrape error:", error);
  }

  // Method 3: Fallback to TikWM
  try {
    const formData = new URLSearchParams();
    formData.append("url", originalUrl);
    formData.append("hd", "1");

    const response = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "Origin": "https://www.tikwm.com",
        "Referer": "https://www.tikwm.com/",
      },
      body: formData.toString(),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.code === 0 && data.data) {
        const videoData = data.data;
        return {
          downloadUrl: videoData.hdplay || videoData.play || null,
          thumbnail: videoData.cover || videoData.origin_cover || null,
          description: videoData.title || null,
          author: videoData.author?.unique_id || null,
        };
      }
    }
  } catch (error) {
    console.error("TikWM API error:", error);
  }

  return { downloadUrl: null, thumbnail: null, description: null, author: null };
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
