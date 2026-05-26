import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Loader2, LogIn, Sparkles } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { Badge } from "#/components/ui/badge";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { ToolPageLayout } from "#/features/tools/tool-page-layout";

const STORAGE_KEY = "viewlify-hashtag-gen-usage";
const ANONYMOUS_DAILY_LIMIT = 3;

type StoredUsage = {
  count: number;
  date: string; // YYYY-MM-DD
};

function getStoredUsage(): StoredUsage {
  if (typeof window === "undefined") {
    return { count: 0, date: "" };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { count: 0, date: getTodayDate() };
    }
    const parsed = JSON.parse(stored) as StoredUsage;
    // Reset if it's a new day
    if (parsed.date !== getTodayDate()) {
      return { count: 0, date: getTodayDate() };
    }
    return parsed;
  } catch {
    return { count: 0, date: getTodayDate() };
  }
}

function setStoredUsage(usage: StoredUsage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export const Route = createFileRoute("/tools/tiktok-hashtag-generator")({
  component: HashtagGeneratorPage,
  head: () => ({
    meta: [
      { title: "AI TikTok Hashtag Generator | Free Tool | Viewlify" },
      {
        name: "description",
        content:
          "Generate trending TikTok hashtags with AI. Enter your niche and get 10-15 optimized hashtags to maximize reach and engagement.",
      },
      {
        name: "keywords",
        content:
          "TikTok hashtag generator, AI hashtags, trending hashtags, TikTok growth, viral hashtags, hashtag suggestions",
      },
      {
        property: "og:title",
        content: "AI TikTok Hashtag Generator | Viewlify",
      },
      {
        property: "og:description",
        content: "Generate trending TikTok hashtags with AI for your niche.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "AI TikTok Hashtag Generator" },
      {
        name: "twitter:description",
        content: "Generate optimized TikTok hashtags with AI.",
      },
    ],
  }),
});

function HashtagGeneratorPage() {
  const [niche, setNiche] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [usage, setUsage] = useState<StoredUsage>({ count: 0, date: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load usage from localStorage on mount
  useEffect(() => {
    setUsage(getStoredUsage());
  }, []);

  const remainingUses = Math.max(0, ANONYMOUS_DAILY_LIMIT - usage.count);
  const isLimitReached = !isAuthenticated && remainingUses === 0;

  const handleGenerate = async () => {
    if (!niche.trim() || loading) return;

    setLoading(true);
    setError(null);
    setHashtags([]);

    try {
      const response = await fetch("/api/tools/generate-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          clientUsageCount: usage.count,
        }),
      });

      const data = (await response.json()) as {
        hashtags?: string[];
        error?: string;
        remainingUses?: number;
        isAuthenticated?: boolean;
      };

      if (!response.ok) {
        if (data.error === "RATE_LIMIT_EXCEEDED") {
          setError("Daily limit reached. Sign in for unlimited access.");
          setUsage((prev) => ({ ...prev, count: ANONYMOUS_DAILY_LIMIT }));
          setStoredUsage({ count: ANONYMOUS_DAILY_LIMIT, date: getTodayDate() });
        } else {
          setError(data.error || "An error occurred. Please try again.");
        }
        return;
      }

      if (data.hashtags) {
        setHashtags(data.hashtags);
      }

      if (data.isAuthenticated) {
        setIsAuthenticated(true);
      } else {
        // Increment usage
        const newUsage = { count: usage.count + 1, date: getTodayDate() };
        setUsage(newUsage);
        setStoredUsage(newUsage);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    const text = hashtags.map((t) => `#${t}`).join(" ");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTag = async (tag: string) => {
    await navigator.clipboard.writeText(`#${tag}`);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <ToolPageLayout toolId="tiktok-hashtag-generator">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "AI TikTok Hashtag Generator",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            description:
              "Generate trending TikTok hashtags with AI for your niche.",
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
        {/* Usage Counter */}
        {!isAuthenticated && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-2">
            <span className="text-sm text-muted-foreground">
              {remainingUses > 0 ? (
                <>
                  <span className="font-semibold text-foreground">
                    {remainingUses}
                  </span>{" "}
                  free {remainingUses === 1 ? "generation" : "generations"}{" "}
                  remaining today
                </>
              ) : (
                "Daily limit reached"
              )}
            </span>
            <Link to="/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign in for unlimited
              </Button>
            </Link>
          </div>
        )}

        {/* Input */}
        <div className="space-y-2">
          <label htmlFor="niche" className="text-sm font-medium">
            Describe your niche or content topic
          </label>
          <Textarea
            id="niche"
            placeholder="e.g., fitness motivation for beginners, cooking recipes, travel vlogs, fashion tips..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={loading || isLimitReached}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          className="w-full"
          disabled={loading || !niche.trim() || isLimitReached}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Hashtags
            </>
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Limit Reached CTA */}
        {isLimitReached && !error && (
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Sign in to get unlimited hashtag generations.</span>
              <Link to="/login">
                <Button size="sm" className="ml-4">
                  Sign in free
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {hashtags.length > 0 && (
          <div className="rounded-xl border bg-muted/30 p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {hashtags.length}
                </span>{" "}
                hashtags generated
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAll}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy All
                  </>
                )}
              </Button>
            </div>

            {/* Hashtag Badges */}
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleCopyTag(tag)}
                  className="group"
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    #{tag}
                    {copiedTag === tag ? (
                      <Check className="ml-1.5 h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="ml-1.5 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </Badge>
                </button>
              ))}
            </div>

            {/* Copy Text Preview */}
            <div className="mt-4 rounded-lg bg-background p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Ready to copy:
              </p>
              <p className="text-sm break-all">
                {hashtags.map((t) => `#${t}`).join(" ")}
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-2 font-semibold">How to use these hashtags</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Copy and paste directly into your TikTok caption</li>
            <li>• Use 3-5 hashtags per video for best results</li>
            <li>• Mix trending hashtags (#fyp) with niche-specific ones</li>
            <li>• Test different combinations to see what works best</li>
            <li>• Update your hashtags regularly as trends change</li>
          </ul>
        </div>
      </div>
    </ToolPageLayout>
  );
}
