import { createFileRoute } from "@tanstack/react-router";
import { getProfileDetail } from "#/lib/tiktok/tiktok.profiles.server";

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

function generateOgSvg(
  username: string,
  stats: { videos: number; views: number; likes: number; engagement: string; avatarUrl: string | null }
): string {
  const escapedUsername = escapeXml(username);

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
       <text x="180" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="600" fill="white" text-anchor="middle">${escapedUsername.charAt(0).toUpperCase()}</text>`
  }

  <!-- Username -->
  <text x="260" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="600" fill="#1f2937">@${escapedUsername}</text>
  <text x="260" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#6b7280">TikTok Analytics</text>

  <!-- Stats cards -->
  <!-- Videos -->
  <rect x="60" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="88" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Videos</text>
  <text x="88" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="#1f2937">${formatNumber(stats.videos)}</text>

  <!-- Views -->
  <rect x="335" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="363" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Total Views</text>
  <text x="363" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="#1f2937">${formatNumber(stats.views)}</text>

  <!-- Engagement -->
  <rect x="610" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="638" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Engagement</text>
  <text x="638" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="#1f2937">${stats.engagement}%</text>

  <!-- Likes -->
  <rect x="885" y="250" width="255" height="140" rx="16" fill="white"/>
  <text x="913" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280">Total Likes</text>
  <text x="913" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="600" fill="#1f2937">${formatNumber(stats.likes)}</text>

  <!-- Footer -->
  <rect x="60" y="450" width="40" height="40" rx="8" fill="url(#brand)"/>
  <text x="80" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="white" text-anchor="middle">V</text>
  <text x="115" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#1f2937">Viewlify.app</text>
  <text x="1140" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#6b7280" text-anchor="end">TikTok Analytics &amp; AI Insights</text>
</svg>`;
}

export const Route = createFileRoute("/api/og/profile/$username")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { username } = params;
        const profile = await getProfileDetail(username);

        const stats = profile
          ? {
              videos: profile.totalVideos,
              views: profile.totalViews,
              likes: profile.totalLikes,
              engagement:
                profile.totalViews > 0
                  ? ((profile.totalLikes / profile.totalViews) * 100).toFixed(1)
                  : "0",
              avatarUrl: profile.avatarUrl,
            }
          : { videos: 0, views: 0, likes: 0, engagement: "0", avatarUrl: null };

        const svg = generateOgSvg(username, stats);

        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});
