import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AtSign, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Badge } from "#/components/ui/badge";
import { ToolPageLayout } from "#/features/tools/tool-page-layout";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/tools/tiktok-username-generator")({
  component: UsernameGeneratorPage,
  head: () => ({
    meta: [
      { title: "TikTok Username Generator | AI Username Ideas | Viewlify" },
      {
        name: "description",
        content:
          "Generate creative and unique TikTok username ideas with AI. Enter your niche or name and get 10+ catchy username suggestions instantly.",
      },
      {
        name: "keywords",
        content:
          "TikTok username generator, TikTok name ideas, username ideas, TikTok handle generator, creative usernames",
      },
      {
        property: "og:title",
        content: "TikTok Username Generator | Viewlify",
      },
      {
        property: "og:description",
        content: "Get creative TikTok username ideas powered by AI.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "TikTok Username Generator" },
      {
        name: "twitter:description",
        content: "Generate unique TikTok usernames with AI for free.",
      },
    ],
  }),
});

const STYLE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "playful", label: "Playful" },
  { value: "mysterious", label: "Mysterious" },
  { value: "aesthetic", label: "Aesthetic" },
];

function UsernameGeneratorPage() {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [remainingUses, setRemainingUses] = useState(() => {
    if (typeof window === "undefined") return 3;
    const stored = localStorage.getItem("usernameGenUses");
    if (!stored) return 3;
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    if (data.date !== today) return 3;
    return Math.max(0, 3 - data.count);
  });

  const getUsageCount = () => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem("usernameGenUses");
    if (!stored) return 0;
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    if (data.date !== today) return 0;
    return data.count || 0;
  };

  const handleGenerate = async () => {
    if (!niche.trim()) {
      setError("Please enter your niche or interest");
      return;
    }

    const currentUsage = getUsageCount();
    if (remainingUses <= 0) {
      setError("Daily limit reached. Sign up for unlimited generations!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tools/generate-usernames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          niche: niche.trim(),
          style: style || undefined,
          clientUsageCount: currentUsage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "RATE_LIMIT_EXCEEDED") {
          setRemainingUses(0);
          setError("Daily limit reached. Sign in for unlimited access!");
          return;
        }
        throw new Error(data.error || "Failed to generate usernames");
      }

      setUsernames(data.usernames);

      // Update rate limit in localStorage
      const today = new Date().toDateString();
      const newCount = currentUsage + 1;
      localStorage.setItem("usernameGenUses", JSON.stringify({ date: today, count: newCount }));
      setRemainingUses(data.remainingUses >= 0 ? data.remainingUses : 3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (username: string, index: number) => {
    await navigator.clipboard.writeText(username);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllUsernames = async () => {
    const text = usernames.map((u) => `@${u}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ToolPageLayout toolId="tiktok-username-generator">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TikTok Username Generator",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            description: "Generate creative and unique TikTok username ideas with AI.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            creator: {
              "@type": "Organization",
              name: "Viewlify",
            },
          }),
        }}
      />

      <div className="space-y-6">
        {/* Input Form */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name (optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Alex, Luna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Niche / Interest *</Label>
            <Input
              id="niche"
              type="text"
              placeholder="e.g., cooking, gaming, fitness"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              maxLength={50}
            />
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <Label>Style (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStyle(style === option.value ? "" : option.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  style === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !niche.trim()}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Usernames
            </>
          )}
        </Button>

        {/* Rate Limit Notice */}
        <p className="text-center text-sm text-muted-foreground">
          {remainingUses}/3 free generations remaining today
        </p>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Results */}
        {usernames.length > 0 && (
          <div className="rounded-xl border bg-muted/30 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Username Ideas</h3>
              <Button variant="outline" size="sm" onClick={copyAllUsernames}>
                {copiedIndex === -1 ? (
                  <>
                    <Check className="mr-1 h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy All
                  </>
                )}
              </Button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {usernames.map((username, index) => (
                <button
                  key={username}
                  type="button"
                  onClick={() => copyToClipboard(username, index)}
                  className="group flex items-center justify-between rounded-lg border bg-background p-3 text-left transition-colors hover:border-primary"
                >
                  <span className="font-mono">
                    <span className="text-muted-foreground">@</span>
                    {username}
                  </span>
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Click any username to copy it
            </p>
          </div>
        )}

        {/* Tips Section */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-3 font-semibold">Tips for choosing a TikTok username</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Keep it short and memorable (under 15 characters is ideal)</span>
            </li>
            <li className="flex items-start gap-2">
              <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Avoid numbers unless they have meaning (like birth year)</span>
            </li>
            <li className="flex items-start gap-2">
              <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Make it easy to spell and pronounce</span>
            </li>
            <li className="flex items-start gap-2">
              <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Consider using the same handle across all social platforms</span>
            </li>
          </ul>
        </div>
      </div>
    </ToolPageLayout>
  );
}
