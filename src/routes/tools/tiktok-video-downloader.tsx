import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, ExternalLink, Link as LinkIcon, Copy, Check } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { ToolPageLayout } from "#/features/tools/tool-page-layout";

export const Route = createFileRoute("/tools/tiktok-video-downloader")({
  component: VideoDownloaderPage,
  head: () => ({
    meta: [
      { title: "TikTok Video Downloader | Download Without Watermark | Viewlify" },
      {
        name: "description",
        content:
          "Download TikTok videos without watermark for free. Just paste the video URL and download in HD quality. Fast, easy, and no registration required.",
      },
      {
        name: "keywords",
        content:
          "TikTok video downloader, download TikTok, TikTok no watermark, save TikTok video, TikTok download free, TikTok video saver",
      },
      {
        property: "og:title",
        content: "TikTok Video Downloader | Viewlify",
      },
      {
        property: "og:description",
        content: "Download TikTok videos without watermark. Fast and free.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "TikTok Video Downloader",
      },
      {
        name: "twitter:description",
        content: "Download any TikTok video without watermark for free.",
      },
    ],
  }),
});

const DOWNLOAD_SERVICES = [
  {
    name: "SnapTik",
    url: "https://snaptik.app",
    description: "Fast and reliable, no watermark",
  },
  {
    name: "SSSTik",
    url: "https://ssstik.io",
    description: "HD quality, multiple formats",
  },
  {
    name: "SaveTik",
    url: "https://savetik.co",
    description: "Simple interface, quick downloads",
  },
];

function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const isValidTikTokUrl = (input: string) => {
    const tiktokPatterns = [
      /tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /tiktok\.com\/t\/[\w]+/,
      /vm\.tiktok\.com\/[\w]+/,
      /vt\.tiktok\.com\/[\w]+/,
    ];
    return tiktokPatterns.some((pattern) => pattern.test(input));
  };

  const handleCopy = async () => {
    if (!url.trim()) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openService = (serviceUrl: string) => {
    window.open(serviceUrl, "_blank", "noopener,noreferrer");
  };

  const isValid = url.trim() && isValidTikTokUrl(url);

  return (
    <ToolPageLayout toolId="tiktok-video-downloader">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "TikTok Video Downloader",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            description:
              "Download TikTok videos without watermark. Fast, free, and easy to use.",
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
        {/* Step 1: Paste URL */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-sm font-medium">
              Step 1: Paste your TikTok video URL
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://www.tiktok.com/@user/video/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!url.trim()}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            {url.trim() && !isValid && (
              <p className="text-sm text-amber-600">
                This doesn't look like a valid TikTok URL. Make sure it contains "tiktok.com"
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Choose service */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Step 2: Open a download service and paste your URL
          </Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {DOWNLOAD_SERVICES.map((service) => (
              <button
                key={service.name}
                onClick={() => openService(service.url)}
                className="group flex flex-col items-start gap-2 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-semibold">{service.name}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {service.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick tip */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h3 className="mb-2 font-semibold text-primary">Quick tip</h3>
          <p className="text-sm text-muted-foreground">
            Copy your TikTok URL above, then click on any service. On the service's website,
            paste your URL and click download. Most services offer HD quality without watermark.
          </p>
        </div>

        {/* Instructions */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <h3 className="mb-3 font-semibold">How to download TikTok videos:</h3>
          <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
            <li>Open TikTok and find the video you want to download</li>
            <li>Tap the share button and copy the video link</li>
            <li>Paste the link in the field above</li>
            <li>Click "Copy" then open one of the download services</li>
            <li>Paste your URL on the service and download</li>
          </ol>
        </div>

        {/* Supported Links */}
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Supported URL formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>tiktok.com/@username/video/123456789</li>
            <li>vm.tiktok.com/ZMxxxxxxx/</li>
            <li>vt.tiktok.com/ZSxxxxxxx/</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground">
          This tool helps you access video download services. Please respect copyright and the original creators' rights.
          Downloaded content should not be used for commercial purposes without permission.
        </p>
      </div>
    </ToolPageLayout>
  );
}
