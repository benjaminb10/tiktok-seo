import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "#/features/landing/landing-page";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "TikTok Analytics Tool - Viral Video Analysis | Viewlify.app",
      },
      {
        name: "description",
        content:
          "Analyze TikTok profiles in 30s. AI-powered insights on viral hooks, engagement patterns & content strategies. Used by 5,000+ creators. Free trial available.",
      },
      {
        name: "keywords",
        content:
          "TikTok analytics, TikTok SEO, viral video analyzer, TikTok competitor analysis, TikTok engagement rate, social media analytics tool",
      },
      {
        property: "og:title",
        content: "TikTok Analytics Tool That Reveals Why Videos Go Viral",
      },
      {
        property: "og:description",
        content:
          "Join 5,000+ creators using AI-powered analytics to understand and replicate viral TikTok success. Start your free analysis today.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Viewlify.app",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "TikTok Analytics Tool - Discover Viral Patterns",
      },
      {
        name: "twitter:description",
        content:
          "AI-powered TikTok analytics used by 5,000+ creators. Get insights on viral hooks and engagement patterns in 30 seconds.",
      },
    ],
  }),
});

function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Viewlify.app",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "TikTok analytics tool that helps creators, agencies, and brands analyze profiles and discover viral content patterns using AI.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "1200",
              bestRating: "5",
              worstRating: "1",
            },
            creator: {
              "@type": "Organization",
              name: "Viewlify.app",
            },
          }),
        }}
      />
      <LandingPage />
    </>
  );
}
