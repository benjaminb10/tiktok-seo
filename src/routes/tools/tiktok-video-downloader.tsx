import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Loader2, AlertCircle, CheckCircle, Link as LinkIcon } from "lucide-react";
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

type DownloadState = "idle" | "loading" | "success" | "error";

function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<DownloadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    thumbnail?: string;
    description?: string;
    downloadUrl?: string;
  } | null>(null);

  const isValidTikTokUrl = (input: string) => {
    const tiktokPatterns = [
      /tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /tiktok\.com\/t\/[\w]+/,
      /vm\.tiktok\.com\/[\w]+/,
      /vt\.tiktok\.com\/[\w]+/,
    ];
    return tiktokPatterns.some((pattern) => pattern.test(input));
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a TikTok video URL");
      setState("error");
      return;
    }

    if (!isValidTikTokUrl(url)) {
      setError("Please enter a valid TikTok video URL");
      setState("error");
      return;
    }

    setState("loading");
    setError(null);

    try {
      // Call the download API
      const response = await fetch("/api/tools/download-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process video");
      }

      const data = await response.json();
      setVideoInfo({
        thumbnail: data.thumbnail,
        description: data.description,
        downloadUrl: data.downloadUrl,
      });
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download video");
      setState("error");
    }
  };

  const handleReset = () => {
    setUrl("");
    setState("idle");
    setError(null);
    setVideoInfo(null);
  };

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
        {/* Input Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url" className="text-sm font-medium">
              TikTok Video URL
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://www.tiktok.com/@user/video/..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={handleDownload}
                disabled={state === "loading" || !url.trim()}
                className="gap-2"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {state === "loading" ? "Processing..." : "Download"}
              </Button>
            </div>
          </div>

          {/* Error State */}
          {state === "error" && error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success State */}
          {state === "success" && videoInfo && (
            <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Video ready to download!</span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt="Video thumbnail"
                    className="h-32 w-auto rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 space-y-3">
                  {videoInfo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {videoInfo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {videoInfo.downloadUrl && (
                      <Button
                        className="gap-2"
                        asChild
                      >
                        <a
                          href={`/api/tools/proxy-video?url=${encodeURIComponent(videoInfo.downloadUrl)}`}
                          download={`tiktok-video-${Date.now()}.mp4`}
                        >
                          <Download className="h-4 w-4" />
                          Download Video
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleReset}>
                      Download Another
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: If download doesn't start, right-click the button and select "Save link as..."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <h3 className="mb-3 font-semibold">How to download TikTok videos:</h3>
          <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
            <li>Open TikTok and find the video you want to download</li>
            <li>Tap the share button and copy the video link</li>
            <li>Paste the link in the field above</li>
            <li>Click "Download" and save the video</li>
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
          This tool is for personal use only. Please respect copyright and the original creators' rights.
          Downloaded content should not be used for commercial purposes without permission.
        </p>
      </div>
    </ToolPageLayout>
  );
}
