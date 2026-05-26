import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Progress } from "#/components/ui/progress";
import { ToolPageLayout } from "#/features/tools/tool-page-layout";
import { getBenchmark } from "#/features/tools/tools-data";

export const Route = createFileRoute("/tools/tiktok-engagement-calculator")({
  component: EngagementCalculatorPage,
  head: () => ({
    meta: [
      { title: "TikTok Engagement Rate Calculator | Free Tool | Viewlify" },
      {
        name: "description",
        content:
          "Calculate your TikTok engagement rate instantly. Enter views, likes, comments, and shares to see how your content performs against benchmarks.",
      },
      {
        name: "keywords",
        content:
          "TikTok engagement rate, engagement calculator, TikTok analytics, viral content, engagement benchmark",
      },
      {
        property: "og:title",
        content: "TikTok Engagement Rate Calculator | Viewlify",
      },
      {
        property: "og:description",
        content:
          "Free tool to calculate and benchmark your TikTok engagement rate.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "TikTok Engagement Calculator",
      },
      {
        name: "twitter:description",
        content: "Calculate your TikTok engagement rate for free.",
      },
    ],
  }),
});

function EngagementCalculatorPage() {
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const v = Number.parseInt(views, 10) || 0;
    const l = Number.parseInt(likes, 10) || 0;
    const c = Number.parseInt(comments, 10) || 0;
    const s = Number.parseInt(shares, 10) || 0;

    if (v === 0) {
      setResult(null);
      return;
    }

    const interactions = l + c + s;
    const rate = interactions / v;
    setResult(rate);
  };

  const handleReset = () => {
    setViews("");
    setLikes("");
    setComments("");
    setShares("");
    setResult(null);
  };

  const benchmark = result !== null ? getBenchmark(result) : null;
  const progressValue = result !== null ? Math.min((result / 0.15) * 100, 100) : 0;

  return (
    <ToolPageLayout toolId="tiktok-engagement-calculator">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TikTok Engagement Rate Calculator",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            description:
              "Calculate your TikTok engagement rate and compare to industry benchmarks.",
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
            <Label htmlFor="views">Views *</Label>
            <Input
              id="views"
              type="number"
              placeholder="e.g., 10000"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="likes">Likes *</Label>
            <Input
              id="likes"
              type="number"
              placeholder="e.g., 500"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Input
              id="comments"
              type="number"
              placeholder="e.g., 50"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shares">Shares</Label>
            <Input
              id="shares"
              type="number"
              placeholder="e.g., 20"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min={0}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1">
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Engagement
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {/* Result */}
        {result !== null && benchmark && (
          <div className="rounded-xl border bg-muted/30 p-6">
            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your engagement rate is
              </p>
              <p className={`text-5xl font-bold ${benchmark.color}`}>
                {(result * 100).toFixed(2)}%
              </p>
            </div>

            {/* Visual Progress */}
            <div className="mb-4">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>15%+</span>
              </div>
              <Progress value={progressValue} className="h-3" />
            </div>

            {/* Benchmark Badge */}
            <div
              className={`rounded-lg p-4 ${benchmark.bgColor} border`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${benchmark.color}`}>
                  {benchmark.label}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {benchmark.description}
              </p>
            </div>

            {/* Breakdown */}
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
              <div className="rounded-lg bg-background p-2">
                <div className="font-semibold">
                  {Number(views).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
              <div className="rounded-lg bg-background p-2">
                <div className="font-semibold">
                  {Number(likes).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
              <div className="rounded-lg bg-background p-2">
                <div className="font-semibold">
                  {Number(comments || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </div>
              <div className="rounded-lg bg-background p-2">
                <div className="font-semibold">
                  {Number(shares || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Shares</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-2 font-semibold">How is engagement rate calculated?</h3>
          <p className="text-sm text-muted-foreground">
            Engagement rate = (Likes + Comments + Shares) / Views × 100
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>0-2%: Low engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>2-5%: Average engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>5-10%: Good engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>10%+: Viral potential</span>
            </div>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
