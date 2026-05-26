import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tools/proxy-video")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const videoUrl = url.searchParams.get("url");

          if (!videoUrl) {
            return new Response("Missing video URL", { status: 400 });
          }

          // Fetch the video with proper headers
          const response = await fetch(videoUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer": "https://www.tiktok.com/",
              "Accept": "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
              "Accept-Language": "en-US,en;q=0.5",
              "Range": request.headers.get("Range") || "bytes=0-",
            },
          });

          if (!response.ok) {
            return new Response("Failed to fetch video", { status: response.status });
          }

          // Get content info
          const contentLength = response.headers.get("Content-Length");
          const contentType = response.headers.get("Content-Type") || "video/mp4";

          // Create response headers
          const headers = new Headers({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="tiktok-video-${Date.now()}.mp4"`,
            "Cache-Control": "public, max-age=3600",
          });

          if (contentLength) {
            headers.set("Content-Length", contentLength);
          }

          // Handle range requests for streaming
          const rangeHeader = response.headers.get("Content-Range");
          if (rangeHeader) {
            headers.set("Content-Range", rangeHeader);
            headers.set("Accept-Ranges", "bytes");
          }

          return new Response(response.body, {
            status: response.status,
            headers,
          });
        } catch (error) {
          console.error("Proxy video error:", error);
          return new Response("Failed to proxy video", { status: 500 });
        }
      },
    },
  },
});
