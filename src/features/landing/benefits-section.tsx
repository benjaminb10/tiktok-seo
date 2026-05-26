import { Rocket, Target, TrendingUp, Zap } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Create Content That Actually Works",
    description:
      "Stop wasting time on videos that flop. Know exactly what hooks, formats, and topics your audience wants to see before you hit record.",
    metric: "3x higher engagement",
  },
  {
    icon: TrendingUp,
    title: "Grow Faster Than Your Competitors",
    description:
      "See what's working for your competitors and replicate their success. Get insights they don't even know about their own content.",
    metric: "10x faster growth",
  },
  {
    icon: Zap,
    title: "Save Hours Every Week",
    description:
      "No more manual research or guesswork. Get instant analytics and AI insights that would take you days to compile manually.",
    metric: "Save 10+ hours/week",
  },
  {
    icon: Rocket,
    title: "Catch Trends Before They Peak",
    description:
      "Identify viral patterns and trending formats while they're still fresh. Be the trendsetter, not the follower.",
    metric: "Spot trends 2 weeks early",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
            What you'll achieve with Viewlify
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of creators who transformed their TikTok strategy
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group relative rounded-lg border bg-background p-6 transition-shadow hover:shadow-sm"
            >
              {/* Number Badge */}
              <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <benefit.icon className="h-5 w-5 text-foreground" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-base font-semibold text-foreground">{benefit.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{benefit.description}</p>

              {/* Metric Badge */}
              <div className="inline-flex items-center gap-2 rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {benefit.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
