import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Wrench } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { LandingFooter } from "#/components/landing-footer";
import { TOOLS } from "#/features/tools/tools-data";

export const Route = createFileRoute("/tools/")({
  component: ToolsIndexPage,
  head: () => ({
    meta: [
      { title: "Free TikTok Tools | Viewlify" },
      {
        name: "description",
        content:
          "Free TikTok tools to boost your content. Calculate engagement rates, extract hashtags, and generate AI-powered hashtag suggestions.",
      },
      {
        name: "keywords",
        content:
          "TikTok tools, engagement calculator, hashtag extractor, hashtag generator, TikTok analytics, free tools",
      },
      { property: "og:title", content: "Free TikTok Tools | Viewlify" },
      {
        property: "og:description",
        content: "Free tools to optimize your TikTok content strategy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Viewlify" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Free TikTok Tools | Viewlify" },
      {
        name: "twitter:description",
        content:
          "Calculate engagement, extract hashtags, and get AI suggestions.",
      },
    ],
  }),
});

function ToolsIndexPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Free TikTok Tools",
            description:
              "Collection of free TikTok tools including engagement calculator, hashtag extractor, and AI hashtag generator.",
            creator: {
              "@type": "Organization",
              name: "Viewlify",
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: TOOLS.map((tool, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "WebApplication",
                  name: tool.title,
                  description: tool.description,
                  url: `https://viewlify.app${tool.href}`,
                  applicationCategory: "UtilityApplication",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                },
              })),
            },
          }),
        }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="border-b bg-muted/30 py-16">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Free TikTok Tools
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Boost your TikTok content with our free tools. No signup required.
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-6 md:grid-cols-3">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => navigate({ to: tool.href as "/tools/engagement-calculator" })}
                  className="block w-full text-left"
                >
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                    <CardHeader>
                      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <tool.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-muted-foreground">
                        {tool.description}
                      </p>
                      <span className="inline-flex items-center text-sm font-medium text-primary">
                        Try it free
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-primary py-16">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              Want deeper insights?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
              Analyze any TikTok profile with detailed metrics, engagement
              trends, AI-powered recommendations, and more.
            </p>
            <Link to="/app">
              <Button size="lg" variant="secondary">
                Try Full Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}
