import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import { searchRuns } from "#/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Admin endpoint to refresh a broken avatar by fetching it from TikTok
 * and storing it directly in R2.
 *
 * POST /api/admin/refresh-avatar
 * Body: { handle: string }
 */
export const Route = createFileRoute("/api/admin/refresh-avatar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { handle?: string };
        try {
          body = (await request.json()) as { handle?: string };
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { handle } = body;
        if (!handle) {
          return Response.json({ error: "Missing handle" }, { status: 400 });
        }

        const normalizedHandle = handle.replace(/^@/, "").toLowerCase();
        const profileUrl = `https://www.tiktok.com/@${normalizedHandle}`;

        try {
          // 1. Fetch avatar URL from TikTok profile page
          const avatarUrl = await fetchProfileAvatarFromWeb(profileUrl);

          if (!avatarUrl) {
            return Response.json({ error: "Could not find avatar on TikTok profile" }, { status: 404 });
          }

          // 2. Download the avatar image
          const imageResponse = await fetch(avatarUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
              "Referer": "https://www.tiktok.com/",
            },
          });

          if (!imageResponse.ok) {
            return Response.json({
              error: `Failed to download avatar: ${imageResponse.status}`,
              avatarUrl
            }, { status: 502 });
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

          // 3. Store in R2
          const r2Key = `avatars/${normalizedHandle}`;
          await env.IMAGES.put(r2Key, imageBuffer, {
            httpMetadata: {
              contentType,
            },
          });

          // 4. Update the avatar URL in the database (for reference)
          await db
            .update(searchRuns)
            .set({ avatarUrl })
            .where(eq(searchRuns.handle, normalizedHandle));

          return Response.json({
            success: true,
            handle: normalizedHandle,
            r2Key,
            avatarUrl,
            contentType,
            size: imageBuffer.byteLength,
          });
        } catch (error) {
          console.error("Error refreshing avatar:", error);
          return Response.json({
            error: "Error refreshing avatar",
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 });
        }
      },
    },
  },
});

async function fetchProfileAvatarFromWeb(profileUrl: string): Promise<string | null> {
  try {
    const response = await fetch(profileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!response.ok) return null;

    const html = await response.text();

    // TikTok embeds user data in a <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"> tag
    const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s);
    if (!match) return null;

    const jsonData = JSON.parse(match[1] || "{}");
    const userDetail = jsonData?.__DEFAULT_SCOPE__?.["webapp.user-detail"]?.userInfo?.user;

    // Try to get the avatar URL from the user data
    const avatarUrl =
      userDetail?.avatarLarger ||
      userDetail?.avatarMedium ||
      userDetail?.avatarThumb ||
      userDetail?.avatar;

    if (typeof avatarUrl === "string" && avatarUrl.startsWith("http")) {
      return avatarUrl;
    }

    return null;
  } catch (error) {
    console.error("[fetchProfileAvatarFromWeb] Error:", error);
    return null;
  }
}
