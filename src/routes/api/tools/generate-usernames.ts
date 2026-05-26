import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getServerSession } from "#/lib/auth.server";

const SYSTEM_PROMPT = `You are a TikTok username expert. Generate creative, unique, and memorable username ideas.

Rules:
- Each username must be 3-24 characters
- Only use letters, numbers, underscores, and periods
- Make them catchy, memorable, and easy to spell
- Mix different styles: professional, playful, clever wordplay
- Avoid numbers at the end unless meaningful
- Use alliteration and rhymes when possible
- Return ONLY usernames, one per line
- No explanations, no numbering, no @ symbol
- Keep variety in the suggestions`;

function parseUsernamesFromResponse(text: string): string[] {
  const lines = text.split("\n");
  const usernames: string[] = [];

  for (const line of lines) {
    const cleaned = line
      .trim()
      .replace(/^[@\d.\s]+/, "")
      .replace(/[^a-zA-Z0-9_.]/g, "");
    if (cleaned && cleaned.length >= 3 && cleaned.length <= 24) {
      usernames.push(cleaned);
    }
  }

  return usernames.slice(0, 10);
}

export const Route = createFileRoute("/api/tools/generate-usernames")({
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
        let body: { name?: string; niche: string; style?: string; clientUsageCount?: number };
        try {
          body = (await request.json()) as { name?: string; niche: string; style?: string; clientUsageCount?: number };
        } catch {
          return new Response(
            JSON.stringify({ error: "Invalid request body" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const { name, niche, style, clientUsageCount = 0 } = body;

        if (!niche || typeof niche !== "string" || niche.trim().length < 2) {
          return new Response(
            JSON.stringify({ error: "Niche must be at least 2 characters" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Rate limiting for anonymous users
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

        // Build the prompt
        const userPrompt = `Generate 10 TikTok username ideas:
${name ? `- Name/Nickname to incorporate: ${name}` : ""}
- Niche/Interest: ${niche}
${style ? `- Preferred style: ${style}` : ""}`;

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
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: userPrompt,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "[generate-usernames] Anthropic API error:",
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

        const usernames = parseUsernamesFromResponse(responseText);

        // Calculate remaining uses
        const newUsageCount = isAuthenticated ? -1 : clientUsageCount + 1;
        const remainingUses = isAuthenticated
          ? -1
          : Math.max(0, ANONYMOUS_DAILY_LIMIT - newUsageCount);

        return new Response(
          JSON.stringify({
            usernames,
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
