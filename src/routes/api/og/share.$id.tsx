import { createFileRoute } from "@tanstack/react-router";
import { db } from "#/db";
import { getShareData } from "#/lib/tiktok/tiktok.runs.server";

function formatNumber(value: number | null): string {
  if (value == null) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateShareOgSvg(
  handle: string,
  stats: {
    videos: number;
    views: number;
    likes: number;
    engagement: string;
    avatarUrl: string | null;
  }
): string {
  const escapedHandle = escapeXml(handle);

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fdf2f8"/>
      <stop offset="50%" style="stop-color:#ede9fe"/>
      <stop offset="100%" style="stop-color:#f8fafc"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="120" cy="120" r="56"/>
    </clipPath>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Avatar circle background -->
  <circle cx="120" cy="120" r="60" fill="white" transform="translate(60, 50)"/>
  ${stats.avatarUrl
    ? `<image href="${escapeXml(stats.avatarUrl)}" x="64" y="54" width="112" height="112" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="120" cy="120" r="56" fill="url(#brand)" transform="translate(60, 50)"/>
       <text x="180" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="600" fill="white" text-anchor="middle">${escapedHandle.charAt(0).toUpperCase()}</text>`
  }

  <!-- Username -->
  <text x="260" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="600" fill="#1f2937">@${escapedHandle}</text>
  <text x="260" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#6b7280">TikTok Analytics Report</text>

  <!-- Stats cards -->
  <!-- Videos -->
  <rect x="60" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="88" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Videos Analyzed</text>
  <text x="88" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="#1f2937">${formatNumber(stats.videos)}</text>

  <!-- Views -->
  <rect x="335" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="363" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Total Views</text>
  <text x="363" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="#1f2937">${formatNumber(stats.views)}</text>

  <!-- Engagement -->
  <rect x="610" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="638" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Engagement Rate</text>
  <text x="638" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="url(#brand)">${stats.engagement}%</text>

  <!-- Likes -->
  <rect x="885" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="913" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Total Likes</text>
  <text x="913" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="#1f2937">${formatNumber(stats.likes)}</text>

  <!-- Footer -->
  <rect x="60" y="450" width="40" height="40" rx="8" fill="url(#brand)"/>
  <text x="80" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="white" text-anchor="middle">V</text>
  <text x="115" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#1f2937">Viewlify.app</text>
  <text x="1140" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280" text-anchor="end">Analyze any TikTok profile for free</text>
</svg>`;
}

export const Route = createFileRoute("/api/og/share/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id } = params;
        const shareData = await getShareData(db, id);

        const stats = shareData
          ? {
              videos: shareData.totalVideos,
              views: shareData.totalViews,
              likes: shareData.totalLikes,
              engagement: shareData.avgEngagement.toFixed(1),
              avatarUrl: shareData.avatarUrl,
            }
          : { videos: 0, views: 0, likes: 0, engagement: "0", avatarUrl: null };

        const handle = shareData?.handle || "Unknown";
        const svg = generateShareOgSvg(handle, stats);

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
