import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import type { ChatRequest, VideoContext } from "#/features/chat/chat.types";

function formatNumber(value: number | null): string {
  if (value == null) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function buildSystemPrompt(context: VideoContext): string {
  const { handle, totalVideos, stats, topVideos } = context;

  const videosList = topVideos
    .map((v, i) => {
      const title = v.title || v.description?.slice(0, 50) || "Untitled";
      return `${i + 1}. "${title}"
   - Views: ${formatNumber(v.viewCount)} | Likes: ${formatNumber(v.likeCount)} | Comments: ${formatNumber(v.commentCount)}
   - Tags: ${v.tags.slice(0, 5).join(", ") || "None"}
   - Published: ${v.publishedAt || "Unknown date"}`;
    })
    .join("\n\n");

  return `You are an AI assistant expert in TikTok analytics. You help users understand their TikTok account performance.

## Analyzed profile: @${handle}

### Global statistics
- Videos analyzed: ${totalVideos}
- Total views: ${formatNumber(stats.totalViews)}
- Total likes: ${formatNumber(stats.totalLikes)}
- Total comments: ${formatNumber(stats.totalComments)}
- Average views per video: ${formatNumber(stats.avgViews)}
- Average likes per video: ${formatNumber(stats.avgLikes)}
- Average engagement rate: ${(stats.avgEngagement * 100).toFixed(2)}%

### Top ${topVideos.length} videos (by views)
${videosList}

## Instructions
- IMPORTANT: Always respond in the same language the user writes in. If they write in English, respond in English. If they write in French, respond in French. Etc.
- Be concise and actionable
- Give practical advice based on the data
- If the user asks an off-topic question, gently bring them back to TikTok analysis`;
}

export const Route = createFileRoute("/api/tools/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = (env as { ANTHROPIC_API_KEY?: string }).ANTHROPIC_API_KEY;

        if (!apiKey) {
          return Response.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 });
        }

        let body: ChatRequest;
        try {
          body = (await request.json()) as ChatRequest;
        } catch {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const systemPrompt = buildSystemPrompt(body.context);

        const messages = [
          ...body.history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: body.message },
        ];

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "anthropic-version": "2023-06-01",
            "anthropic-beta": "oauth-2025-04-20",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: systemPrompt,
            messages,
            stream: true,
          }),
        });

        if (!response.ok) {
          return Response.json({ error: `Erreur API: ${response.status}` }, { status: response.status });
        }

        // Forward the SSE stream from Anthropic
        return new Response(response.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
