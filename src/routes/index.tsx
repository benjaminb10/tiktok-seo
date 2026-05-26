import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "#/features/landing/landing-page";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "Viewlify - Free TikTok Analytics Tool",
      },
      {
        name: "description",
        content:
          "Analyze any TikTok profile for free. See video performance, engagement rates, and content patterns. No signup required.",
      },
      {
        name: "keywords",
        content:
          "TikTok analytics, TikTok profile analyzer, video performance, engagement rate, content analysis",
      },
      {
        property: "og:title",
        content: "Viewlify - Free TikTok Analytics Tool",
      },
      {
        property: "og:description",
        content:
          "Analyze any TikTok profile for free. Discover what content performs best.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:site_name",
        content: "Viewlify",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Viewlify - Free TikTok Analytics",
      },
      {
        name: "twitter:description",
        content:
          "Analyze any TikTok profile for free. See what content works.",
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
            name: "Viewlify",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Free TikTok analytics tool. Analyze any profile and discover content performance patterns.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            },
            creator: {
              "@type": "Organization",
              name: "Viewlify",
            },
          }),
        }}
      />
      <LandingPage />
    </>
  );
}
