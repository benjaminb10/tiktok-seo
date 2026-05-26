import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getServerSession } from "#/lib/auth.server";

const SYSTEM_PROMPT = `You are a TikTok hashtag expert. Generate 12-15 relevant, high-performing hashtags for the given niche or topic.

Rules:
- Mix popular hashtags (high reach, millions of views) with niche-specific ones (targeted, higher engagement)
- Include 2-3 trending formats when relevant (e.g., foryou, fyp, viral)
- Make hashtags relevant to TikTok culture and current trends
- Return ONLY the hashtags, one per line, WITHOUT the # prefix
- No explanations, no numbering, just the hashtag words
- Keep hashtags lowercase
- Avoid overly generic hashtags that won't help discoverability

Example output for "fitness motivation":
fitnessmotivation
gymtok
workoutmotivation
fyp
foryou
fitnessjourney
gymmotivation
fitnesstiktok
workout
getfit
healthylifestyle
fitlife
gymlife`;

function parseHashtagsFromResponse(text: string): string[] {
  const lines = text.split("\n");
  const hashtags: string[] = [];

  for (const line of lines) {
    const cleaned = line.trim().toLowerCase().replace(/^#/, "");
    if (cleaned && /^[\p{L}\p{N}_]+$/u.test(cleaned)) {
      hashtags.push(cleaned);
    }
  }

  return hashtags.slice(0, 15);
}

export const Route = createFileRoute("/api/tools/generate-hashtags")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = (env as { ANTHROPIC_API_KEY?: string }).ANTHROPIC_API_KEY;

        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "API key not configured" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Check authentication
        const session = await getServerSession();
        const isAuthenticated = !!session?.user?.id;

        // Parse request body
        let body: { niche: string; clientUsageCount?: number };
        try {
          body = (await request.json()) as { niche: string; clientUsageCount?: number };
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { niche, clientUsageCount = 0 } = body;

        if (!niche || typeof niche !== "string" || niche.trim().length < 2) {
          return new Response(
            JSON.stringify({ error: "Niche must be at least 2 characters" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Rate limiting for anonymous users (trust client-side count for MVP)
        const ANONYMOUS_DAILY_LIMIT = 3;
        if (!isAuthenticated && clientUsageCount >= ANONYMOUS_DAILY_LIMIT) {
          return new Response(
            JSON.stringify({
              error: "RATE_LIMIT_EXCEEDED",
              remainingUses: 0,
              message: "Daily limit reached. Sign in for unlimited access.",
            }),
            {
              status: 429,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Call Anthropic API
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
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: `Generate TikTok hashtags for: ${niche.trim()}`,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "[generate-hashtags] Anthropic API error:",
            response.status,
            errorText
          );
          return new Response(
            JSON.stringify({ error: `API error: ${response.status}` }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const data = (await response.json()) as {
          content: Array<{ type: string; text?: string }>;
        };

        const textContent = data.content.find((c) => c.type === "text");
        const responseText = textContent?.text || "";

        const hashtags = parseHashtagsFromResponse(responseText);

        // Calculate remaining uses
        const newUsageCount = isAuthenticated ? -1 : clientUsageCount + 1;
        const remainingUses = isAuthenticated
          ? -1
          : Math.max(0, ANONYMOUS_DAILY_LIMIT - newUsageCount);

        return new Response(
          JSON.stringify({
            hashtags,
            remainingUses,
            isAuthenticated,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
    },
  },
});
