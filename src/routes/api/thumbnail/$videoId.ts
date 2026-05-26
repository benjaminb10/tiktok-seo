import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import { tiktokVideos } from "#/db/schema";
import { eq } from "drizzle-orm";

// Cache headers for served images (30 days)
const CACHE_MAX_AGE = 30 * 24 * 60 * 60;

export const Route = createFileRoute("/api/thumbnail/$videoId")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { videoId: string } }) => {
        const { videoId } = params;

        if (!videoId) {
          return new Response("Missing videoId", { status: 400 });
        }

        const r2Key = `thumbnails/${videoId}`;

        try {
          // 1. Check if image exists in R2
          const existingObject = await env.IMAGES.get(r2Key);

          if (existingObject) {
            // Serve from R2
            const headers = new Headers();
            headers.set("Content-Type", existingObject.httpMetadata?.contentType || "image/jpeg");
            headers.set("Cache-Control", `public, max-age=${CACHE_MAX_AGE}`);
            headers.set("X-Cache", "HIT");

            return new Response(existingObject.body, { headers });
          }

          // 2. Image not in R2, fetch from TikTok and store
          const video = await db
            .select({ thumbnailUrl: tiktokVideos.thumbnailUrl })
            .from(tiktokVideos)
            .where(eq(tiktokVideos.id, videoId))
            .limit(1);

          if (!video.length || !video[0].thumbnailUrl) {
            return new Response("Thumbnail not found", { status: 404 });
          }

          const thumbnailUrl = video[0].thumbnailUrl;

          // Fetch from TikTok CDN
          const imageResponse = await fetch(thumbnailUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
              "Referer": "https://www.tiktok.com/",
            },
          });

          if (!imageResponse.ok) {
            console.error(`Failed to fetch thumbnail: ${imageResponse.status}`);
            return new Response("Failed to fetch thumbnail", { status: 502 });
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

          // 3. Store in R2 for permanent caching
          await env.IMAGES.put(r2Key, imageBuffer, {
            httpMetadata: {
              contentType,
            },
          });

          // 4. Return the image
          const headers = new Headers();
          headers.set("Content-Type", contentType);
          headers.set("Cache-Control", `public, max-age=${CACHE_MAX_AGE}`);
          headers.set("X-Cache", "MISS");

          return new Response(imageBuffer, { headers });
        } catch (error) {
          console.error("Error handling thumbnail:", error);
          return new Response("Error fetching thumbnail", { status: 500 });
        }
      },
    },
  },
});
