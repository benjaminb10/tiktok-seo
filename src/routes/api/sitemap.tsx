import { createFileRoute } from "@tanstack/react-router";
import { getAnalyzedProfiles } from "#/lib/tiktok/tiktok.profiles.server";

const BASE_URL = "https://viewlify.app";

type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      let entry = `  <url>\n    <loc>${url.loc}</loc>`;
      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      if (url.changefreq) {
        entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      if (url.priority !== undefined) {
        entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }
      entry += "\n  </url>";
      return entry;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export const Route = createFileRoute("/api/sitemap")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];

        // Static pages
        const staticUrls: SitemapUrl[] = [
          { loc: `${BASE_URL}/`, changefreq: "daily", priority: 1.0, lastmod: today },
          { loc: `${BASE_URL}/pricing`, changefreq: "weekly", priority: 0.8 },
          { loc: `${BASE_URL}/tools`, changefreq: "weekly", priority: 0.9, lastmod: today },
          { loc: `${BASE_URL}/tools/tiktok-hashtag-extractor`, changefreq: "monthly", priority: 0.8 },
          { loc: `${BASE_URL}/tools/tiktok-hashtag-generator`, changefreq: "monthly", priority: 0.8 },
          { loc: `${BASE_URL}/tools/tiktok-money-calculator`, changefreq: "monthly", priority: 0.8 },
          { loc: `${BASE_URL}/tools/tiktok-username-generator`, changefreq: "monthly", priority: 0.8 },
          { loc: `${BASE_URL}/tools/tiktok-engagement-calculator`, changefreq: "monthly", priority: 0.8 },
          { loc: `${BASE_URL}/tools/tiktok-character-counter`, changefreq: "monthly", priority: 0.8 },
          { loc: `${BASE_URL}/tools/tiktok-video-downloader`, changefreq: "monthly", priority: 0.9 },
          { loc: `${BASE_URL}/leaderboard`, changefreq: "daily", priority: 0.8, lastmod: today },
          { loc: `${BASE_URL}/login`, changefreq: "monthly", priority: 0.5 },
          { loc: `${BASE_URL}/help`, changefreq: "monthly", priority: 0.6 },
          { loc: `${BASE_URL}/terms`, changefreq: "yearly", priority: 0.3 },
          { loc: `${BASE_URL}/privacy`, changefreq: "yearly", priority: 0.3 },
        ];

        // Dynamic profile pages
        const profiles = await getAnalyzedProfiles();
        const profileUrls: SitemapUrl[] = profiles.map((profile) => ({
          loc: `${BASE_URL}/profile/${encodeURIComponent(profile.handle)}`,
          lastmod: new Date(profile.lastAnalyzed).toISOString().split("T")[0],
          changefreq: "weekly" as const,
          priority: 0.7,
        }));

        const allUrls = [...staticUrls, ...profileUrls];
        const xml = generateSitemapXml(allUrls);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
