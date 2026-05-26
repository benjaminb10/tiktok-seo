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

type VideoInfo = {
  thumbnail?: string;
  description?: string;
  author?: string;
  downloadUrl?: string;
  hdDownloadUrl?: string;
};

// Call TikWM API directly from client (bypasses server rate limits)
async function fetchVideoFromTikWM(tiktokUrl: string): Promise<VideoInfo> {
  const formData = new URLSearchParams();
  formData.append("url", tiktokUrl);
  formData.append("hd", "1");

  const response = await fetch("https://www.tikwm.com/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch video info");
  }

  const data = await response.json();

  if (data.code !== 0 || !data.data) {
    throw new Error(data.msg || "Could not process this video");
  }

  const videoData = data.data;

  return {
    thumbnail: videoData.cover || videoData.origin_cover,
    description: videoData.title,
    author: videoData.author?.unique_id,
    downloadUrl: videoData.play,
    hdDownloadUrl: videoData.hdplay,
  };
}

function VideoDownloaderPage() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<DownloadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

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
      const info = await fetchVideoFromTikWM(url);

      if (!info.downloadUrl && !info.hdDownloadUrl) {
        throw new Error("Could not extract download URL. The video might be private.");
      }

      setVideoInfo(info);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process video");
      setState("error");
    }
  };

  const handleReset = () => {
    setUrl("");
    setState("idle");
    setError(null);
    setVideoInfo(null);
  };

  const triggerDownload = (downloadUrl: string, quality: string) => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `tiktok-${quality}-${Date.now()}.mp4`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && url.trim()) {
                      handleDownload();
                    }
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
                {state === "loading" ? "Processing..." : "Get Video"}
              </Button>
            </div>
          </div>

          {/* Error State */}
          {state === "error" && error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success State */}
          {state === "success" && videoInfo && (
            <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Video ready to download!</span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                {videoInfo.thumbnail && (
                  <img
                    src={videoInfo.thumbnail}
                    alt="Video thumbnail"
                    className="h-40 w-auto rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 space-y-3">
                  {videoInfo.author && (
                    <p className="text-sm font-medium">@{videoInfo.author}</p>
                  )}
                  {videoInfo.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {videoInfo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {videoInfo.hdDownloadUrl && (
                      <Button
                        className="gap-2"
                        onClick={() => triggerDownload(videoInfo.hdDownloadUrl!, "hd")}
                      >
                        <Download className="h-4 w-4" />
                        Download HD
                      </Button>
                    )}
                    {videoInfo.downloadUrl && (
                      <Button
                        variant={videoInfo.hdDownloadUrl ? "outline" : "default"}
                        className="gap-2"
                        onClick={() => triggerDownload(videoInfo.downloadUrl!, "sd")}
                      >
                        <Download className="h-4 w-4" />
                        {videoInfo.hdDownloadUrl ? "Download SD" : "Download Video"}
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
            <li>Click "Get Video" and then download</li>
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
