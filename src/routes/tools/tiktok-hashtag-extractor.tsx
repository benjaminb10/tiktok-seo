import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Hash, Trash2 } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { Badge } from "#/components/ui/badge";
import { ToolPageLayout } from "#/features/tools/tool-page-layout";

export const Route = createFileRoute("/tools/tiktok-hashtag-extractor")({
  component: HashtagExtractorPage,
  head: () => ({
    meta: [
      { title: "TikTok Hashtag Extractor | Free Tool | Viewlify" },
      {
        name: "description",
        content:
          "Extract all hashtags from any TikTok caption or description. Copy unique hashtags instantly for your content strategy.",
      },
      {
        name: "keywords",
        content:
          "TikTok hashtag extractor, extract hashtags, TikTok caption tool, hashtag finder, hashtag analyzer",
      },
      { property: "og:title", content: "TikTok Hashtag Extractor | Viewlify" },
      {
        property: "og:description",
        content: "Extract all hashtags from any TikTok caption instantly.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "TikTok Hashtag Extractor" },
      {
        name: "twitter:description",
        content: "Extract hashtags from TikTok captions for free.",
      },
    ],
  }),
});

function extractHashtags(text: string): { all: string[]; unique: string[] } {
  const matches = text.matchAll(/#([\p{L}\p{N}_]+)/gu);
  const all = Array.from(matches, (match) => match[1] ?? "");

  const seen = new Set<string>();
  for (const tag of all) {
    const normalized = tag.trim().toLowerCase();
    if (normalized) seen.add(normalized);
  }

  return {
    all,
    unique: Array.from(seen),
  };
}

function HashtagExtractorPage() {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<{ all: string[]; unique: string[] }>({
    all: [],
    unique: [],
  });
  const [copied, setCopied] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleExtract = () => {
    const result = extractHashtags(caption);
    setHashtags(result);
    setCopied(false);
    setCopiedTag(null);
  };

  const handleClear = () => {
    setCaption("");
    setHashtags({ all: [], unique: [] });
    setCopied(false);
    setCopiedTag(null);
  };

  const handleCopyAll = async () => {
    const text = hashtags.unique.map((t) => `#${t}`).join(" ");
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
    <ToolPageLayout toolId="tiktok-hashtag-extractor">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TikTok Hashtag Extractor",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            description:
              "Extract all hashtags from any TikTok caption instantly.",
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
        {/* Input */}
        <div className="space-y-2">
          <label htmlFor="caption" className="text-sm font-medium">
            Paste your TikTok caption or description
          </label>
          <Textarea
            id="caption"
            placeholder="Check out my new video! #fyp #viral #trending #tiktok #foryou #foryoupage"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="min-h-[150px] resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleExtract} className="flex-1">
            <Hash className="mr-2 h-4 w-4" />
            Extract Hashtags
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

        {/* Results */}
        {hashtags.unique.length > 0 && (
          <div className="rounded-xl border bg-muted/30 p-6">
            {/* Stats */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {hashtags.all.length}
                </span>{" "}
                hashtags found
                {hashtags.all.length !== hashtags.unique.length && (
                  <>
                    {" "}
                    (
                    <span className="font-semibold text-foreground">
                      {hashtags.unique.length}
                    </span>{" "}
                    unique)
                  </>
                )}
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
              {hashtags.unique.map((tag) => (
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
                {hashtags.unique.map((t) => `#${t}`).join(" ")}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {caption && hashtags.unique.length === 0 && (
          <div className="rounded-xl border bg-muted/30 p-6 text-center">
            <Hash className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No hashtags found in the text. Make sure hashtags start with #
            </p>
          </div>
        )}

        {/* Tips Section */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-2 font-semibold">Tips for TikTok hashtags</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Use 3-5 highly relevant hashtags per video</li>
            <li>• Mix popular hashtags with niche-specific ones</li>
            <li>• Include trending hashtags when relevant</li>
            <li>• Avoid banned or spammy hashtags</li>
            <li>• Track which hashtags perform best for your content</li>
          </ul>
        </div>
      </div>
    </ToolPageLayout>
  );
}
