import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import { searchRuns } from "#/db/schema";
import { eq, isNotNull, desc } from "drizzle-orm";

// Cache headers for served images (30 days)
const CACHE_MAX_AGE = 30 * 24 * 60 * 60;

export const Route = createFileRoute("/api/avatar/$handle")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { handle: string } }) => {
        const { handle } = params;

        if (!handle) {
          return new Response("Missing handle", { status: 400 });
        }

        // Normalize handle (remove @ if present)
        const normalizedHandle = handle.replace(/^@/, "").toLowerCase();
        const r2Key = `avatars/${normalizedHandle}`;

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

          // 2. Get avatar URL from search_runs (most recent run with avatar)
          const run = await db
            .select({ avatarUrl: searchRuns.avatarUrl })
            .from(searchRuns)
            .where(eq(searchRuns.handle, normalizedHandle))
            .orderBy(desc(searchRuns.createdAt))
            .limit(1);

          if (!run.length || !run[0].avatarUrl) {
            return new Response("Avatar not found", { status: 404 });
          }

          const avatarUrl = run[0].avatarUrl;

          // Fetch from TikTok CDN
          const imageResponse = await fetch(avatarUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
              "Referer": "https://www.tiktok.com/",
            },
          });

          if (!imageResponse.ok) {
            console.error(`Failed to fetch avatar: ${imageResponse.status}`);
            return new Response("Failed to fetch avatar", { status: 502 });
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
          console.error("Error handling avatar:", error);
          return new Response("Error fetching avatar", { status: 500 });
        }
      },
    },
  },
});
