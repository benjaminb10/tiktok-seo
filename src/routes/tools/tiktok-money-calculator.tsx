import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DollarSign, TrendingUp, Users, Eye } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { ToolPageLayout } from "#/features/tools/tool-page-layout";

export const Route = createFileRoute("/tools/tiktok-money-calculator")({
  component: MoneyCalculatorPage,
  head: () => ({
    meta: [
      { title: "TikTok Money Calculator | Estimate Your Earnings | Viewlify" },
      {
        name: "description",
        content:
          "Calculate how much money you can make on TikTok. Estimate earnings from Creator Fund, brand deals, and live gifts based on your views and followers.",
      },
      {
        name: "keywords",
        content:
          "TikTok money calculator, TikTok earnings, TikTok Creator Fund, how much TikTok pays, TikTok income calculator",
      },
      {
        property: "og:title",
        content: "TikTok Money Calculator | Viewlify",
      },
      {
        property: "og:description",
        content: "Estimate your TikTok earnings from Creator Fund, sponsorships, and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "TikTok Money Calculator" },
      {
        name: "twitter:description",
        content: "Calculate your potential TikTok earnings for free.",
      },
    ],
  }),
});

// Earning rates (conservative estimates)
const CREATOR_FUND_RATE = { min: 0.02, max: 0.04 }; // per 1000 views
const BRAND_DEAL_RATE = { min: 10, max: 25 }; // per 1000 followers
const LIVE_GIFT_RATE = { min: 0.01, max: 0.03 }; // per 1000 views

function MoneyCalculatorPage() {
  const [followers, setFollowers] = useState("");
  const [avgViews, setAvgViews] = useState("");
  const [videosPerMonth, setVideosPerMonth] = useState("12");
  const [result, setResult] = useState<{
    creatorFund: { min: number; max: number };
    brandDeals: { min: number; max: number };
    liveGifts: { min: number; max: number };
    total: { min: number; max: number };
  } | null>(null);

  const handleCalculate = () => {
    const f = Number.parseInt(followers, 10) || 0;
    const v = Number.parseInt(avgViews, 10) || 0;
    const vpm = Number.parseInt(videosPerMonth, 10) || 12;

    if (f === 0 && v === 0) {
      setResult(null);
      return;
    }

    const monthlyViews = v * vpm;

    // Creator Fund (need 10k+ followers, 100k views in 30 days)
    const creatorFundMin = f >= 10000 ? (monthlyViews / 1000) * CREATOR_FUND_RATE.min : 0;
    const creatorFundMax = f >= 10000 ? (monthlyViews / 1000) * CREATOR_FUND_RATE.max : 0;

    // Brand Deals (based on followers, 1-2 deals per month if eligible)
    const brandDealMin = f >= 1000 ? (f / 1000) * BRAND_DEAL_RATE.min : 0;
    const brandDealMax = f >= 1000 ? (f / 1000) * BRAND_DEAL_RATE.max * 2 : 0;

    // Live Gifts estimate
    const liveGiftMin = (monthlyViews / 1000) * LIVE_GIFT_RATE.min;
    const liveGiftMax = (monthlyViews / 1000) * LIVE_GIFT_RATE.max;

    setResult({
      creatorFund: { min: creatorFundMin, max: creatorFundMax },
      brandDeals: { min: brandDealMin, max: brandDealMax },
      liveGifts: { min: liveGiftMin, max: liveGiftMax },
      total: {
        min: creatorFundMin + brandDealMin + liveGiftMin,
        max: creatorFundMax + brandDealMax + liveGiftMax,
      },
    });
  };

  const handleReset = () => {
    setFollowers("");
    setAvgViews("");
    setVideosPerMonth("12");
    setResult(null);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ToolPageLayout toolId="tiktok-money-calculator">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TikTok Money Calculator",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            description: "Estimate your TikTok earnings from Creator Fund, brand deals, and live gifts.",
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
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="followers">Followers</Label>
            <Input
              id="followers"
              type="number"
              placeholder="e.g., 50000"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgViews">Avg. Views per Video</Label>
            <Input
              id="avgViews"
              type="number"
              placeholder="e.g., 10000"
              value={avgViews}
              onChange={(e) => setAvgViews(e.target.value)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videosPerMonth">Videos per Month</Label>
            <Input
              id="videosPerMonth"
              type="number"
              placeholder="e.g., 12"
              value={videosPerMonth}
              onChange={(e) => setVideosPerMonth(e.target.value)}
              min={1}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1">
            <DollarSign className="mr-2 h-4 w-4" />
            Calculate Earnings
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border bg-muted/30 p-6">
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">Estimated Monthly Earnings</p>
              <p className="text-4xl font-bold text-green-600">
                {formatMoney(result.total.min)} - {formatMoney(result.total.max)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Creator Fund</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatMoney(result.creatorFund.min)} - {formatMoney(result.creatorFund.max)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Number(followers) < 10000 ? "Need 10k+ followers" : "Based on views"}
                </p>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Brand Deals</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatMoney(result.brandDeals.min)} - {formatMoney(result.brandDeals.max)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Number(followers) < 1000 ? "Need 1k+ followers" : "1-2 deals/month"}
                </p>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Live Gifts</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatMoney(result.liveGifts.min)} - {formatMoney(result.liveGifts.max)}
                </p>
                <p className="text-xs text-muted-foreground">If you go live regularly</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="rounded-lg border bg-background p-4">
          <h3 className="mb-2 font-semibold">How TikTok creators make money</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">Creator Fund:</strong> $0.02-$0.04 per 1,000 views.
              Requires 10k+ followers and 100k views in 30 days.
            </div>
            <div>
              <strong className="text-foreground">Brand Deals:</strong> $10-$25 per 1,000 followers for sponsored posts.
              Rates vary by niche and engagement.
            </div>
            <div>
              <strong className="text-foreground">Live Gifts:</strong> Viewers send virtual gifts during livestreams.
              TikTok takes ~50% commission.
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground italic">
            * These are estimates. Actual earnings depend on content quality, niche, audience demographics, and more.
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
}
