import { ArrowRight, Quote, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

const socialProofItems = [
  {
    type: "insight" as const,
    profile: "@foodblogger",
    content: "Recipe videos under 30s get 3x more engagement than longer ones",
    metric: "+240% engagement",
  },
  {
    type: "testimonial" as const,
    name: "Sarah M.",
    role: "Content Creator",
    content: "I finally understand why some of my videos flop. The engagement breakdown is super helpful.",
    avatar: "SM",
  },
  {
    type: "insight" as const,
    profile: "@fitnesscreator",
    content: "Posts at 7AM perform 2x better than evening posts",
    metric: "Best time: 7AM",
  },
  {
    type: "testimonial" as const,
    name: "Marcus T.",
    role: "Social Media Manager",
    content: "I use this to analyze competitors before pitching new clients. Saves me hours of manual research.",
    avatar: "MT",
  },
  {
    type: "insight" as const,
    profile: "@techreviewer",
    content: "Unboxing videos outperform review videos by 180%",
    metric: "Top format found",
  },
  {
    type: "testimonial" as const,
    name: "Julie K.",
    role: "TikTok Creator",
    content: "Simple and straight to the point. I check my stats here every week now.",
    avatar: "JK",
  },
];

function InsightCard({ item }: { item: typeof socialProofItems[0] }) {
  if (item.type !== "insight") return null;
  return (
    <div className="w-[300px] shrink-0 rounded-xl border bg-background p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <span className="text-sm font-medium text-muted-foreground">
          {item.profile}
        </span>
      </div>
      <p className="mb-3 text-sm text-foreground">
        "{item.content}"
      </p>
      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <TrendingUp className="h-4 w-4" />
        {item.metric}
      </div>
    </div>
  );
}

function TestimonialCard({ item }: { item: typeof socialProofItems[0] }) {
  if (item.type !== "testimonial") return null;
  return (
    <div className="w-[300px] shrink-0 rounded-xl border bg-background p-5">
      <Quote className="mb-3 h-5 w-5 text-muted-foreground/40" />
      <p className="mb-4 text-sm text-foreground">
        "{item.content}"
      </p>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {item.avatar}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{item.name}</div>
          <div className="text-xs text-muted-foreground">{item.role}</div>
        </div>
      </div>
    </div>
  );
}

function SocialProofCard({ item }: { item: typeof socialProofItems[0] }) {
  if (item.type === "insight") {
    return <InsightCard item={item} />;
  }
  return <TestimonialCard item={item} />;
}

export function SocialProofSection() {
  return (
    <section className="border-t bg-muted/30 py-20 lg:py-28">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-4xl px-4 text-center">
        <p className="mb-3 text-sm font-medium text-primary">What creators are saying</p>
        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
          Insights that drive results
        </h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          See what patterns our users discover and how they use them.
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative overflow-hidden">
        {/* Gradient masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-muted/30 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-muted/30 to-transparent" />

        {/* Scrolling content */}
        <div className="flex animate-marquee gap-4 hover:[animation-play-state:paused]">
          {/* First set */}
          {socialProofItems.map((item, index) => (
            <SocialProofCard key={`first-${index}`} item={item} />
          ))}
          {/* Duplicate for seamless loop */}
          {socialProofItems.map((item, index) => (
            <SocialProofCard key={`second-${index}`} item={item} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link to="/app">
          <Button variant="outline">
            Try with any profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
