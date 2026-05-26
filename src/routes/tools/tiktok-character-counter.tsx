import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Type, Check, AlertTriangle } from "lucide-react";
import { Textarea } from "#/components/ui/textarea";
import { Label } from "#/components/ui/label";
import { ToolPageLayout } from "#/features/tools/tool-page-layout";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/tools/tiktok-character-counter")({
  component: CharacterCounterPage,
  head: () => ({
    meta: [
      { title: "TikTok Character Counter | Bio & Caption Limits | Viewlify" },
      {
        name: "description",
        content:
          "Count characters for TikTok bio (80 chars), username (24 chars), and captions (4000 chars). Stay within TikTok's character limits.",
      },
      {
        name: "keywords",
        content:
          "TikTok character counter, TikTok bio limit, TikTok caption length, TikTok username limit, character count",
      },
      {
        property: "og:title",
        content: "TikTok Character Counter | Viewlify",
      },
      {
        property: "og:description",
        content: "Check if your TikTok bio, username, or caption fits within the character limits.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "TikTok Character Counter" },
      {
        name: "twitter:description",
        content: "Count characters for TikTok bio, username, and captions.",
      },
    ],
  }),
});

const LIMITS = {
  bio: { limit: 80, label: "Bio", placeholder: "Enter your TikTok bio..." },
  username: { limit: 24, label: "Username", placeholder: "Enter your username..." },
  caption: { limit: 4000, label: "Caption", placeholder: "Enter your video caption..." },
} as const;

type LimitType = keyof typeof LIMITS;

function CharacterCounterPage() {
  const [activeTab, setActiveTab] = useState<LimitType>("bio");
  const [text, setText] = useState("");

  const currentLimit = LIMITS[activeTab];
  const charCount = text.length;
  const remaining = currentLimit.limit - charCount;
  const percentage = Math.min((charCount / currentLimit.limit) * 100, 100);
  const isOver = charCount > currentLimit.limit;
  const isNearLimit = remaining <= 10 && remaining > 0;

  return (
    <ToolPageLayout toolId="tiktok-character-counter">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TikTok Character Counter",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            description: "Count characters for TikTok bio, username, and captions with real-time feedback.",
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
        {/* Tab Selector */}
        <div className="flex gap-2">
          {(Object.keys(LIMITS) as LimitType[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTab(key);
                setText("");
              }}
              className={cn(
                "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                activeTab === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {LIMITS[key].label}
              <span className="ml-1 text-xs opacity-70">({LIMITS[key].limit})</span>
            </button>
          ))}
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text">{currentLimit.label}</Label>
          <Textarea
            id="text"
            placeholder={currentLimit.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={activeTab === "caption" ? 6 : 3}
            className={cn(
              "resize-none transition-colors",
              isOver && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        </div>

        {/* Character Count Display */}
        <div className="rounded-xl border bg-muted/30 p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Character count</span>
              <span className={cn(
                "font-medium",
                isOver ? "text-red-500" : isNearLimit ? "text-yellow-500" : "text-foreground"
              )}>
                {charCount} / {currentLimit.limit}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  isOver ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-green-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Status Message */}
          <div className={cn(
            "flex items-center gap-2 rounded-lg p-3",
            isOver ? "bg-red-100 text-red-700" : isNearLimit ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
          )}>
            {isOver ? (
              <>
                <AlertTriangle className="h-5 w-5" />
                <span>Over limit by {Math.abs(remaining)} characters. Please shorten your text.</span>
              </>
            ) : isNearLimit ? (
              <>
                <AlertTriangle className="h-5 w-5" />
                <span>Almost at limit! {remaining} characters remaining.</span>
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                <span>{remaining} characters remaining. You're good!</span>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-background p-3">
              <div className="text-2xl font-bold">{charCount}</div>
              <div className="text-xs text-muted-foreground">Characters</div>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-2xl font-bold">{text.trim().split(/\s+/).filter(Boolean).length}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-2xl font-bold">{(text.match(/#[\w]+/g) || []).length}</div>
              <div className="text-xs text-muted-foreground">Hashtags</div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-3 font-semibold">TikTok Character Limits</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span>Username</span>
              <span className="font-medium">24 characters</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span>Bio</span>
              <span className="font-medium">80 characters</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span>Video Caption</span>
              <span className="font-medium">4,000 characters</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: Keep your bio concise and include a call-to-action. For captions, front-load important info as only the first ~150 characters show before "more".
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
}
