import { Rocket, Target, TrendingUp, Zap } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Create Content That Actually Works",
    description:
      "Stop wasting time on videos that flop. Know exactly what hooks, formats, and topics your audience wants to see before you hit record.",
    metric: "3x higher engagement",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    title: "Grow Faster Than Your Competitors",
    description:
      "See what's working for your competitors and replicate their success. Get insights they don't even know about their own content.",
    metric: "10x faster growth",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Save Hours Every Week",
    description:
      "No more manual research or guesswork. Get instant analytics and AI insights that would take you days to compile manually.",
    metric: "Save 10+ hours/week",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Rocket,
    title: "Catch Trends Before They Peak",
    description:
      "Identify viral patterns and trending formats while they're still fresh. Be the trendsetter, not the follower.",
    metric: "Spot trends 2 weeks early",
    gradient: "from-orange-500 to-amber-500",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Zap className="h-4 w-4 text-violet-500" />
            <span className="text-muted-foreground">Real Results, Real Fast</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            What you'll achieve with Viewlify.ai
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of creators who transformed their TikTok strategy
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group relative rounded-2xl border bg-background p-8 transition-all hover:shadow-xl hover:shadow-purple-500/10"
            >
              {/* Number Badge */}
              <div className="absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-background text-sm font-bold shadow-lg ring-2 ring-border">
                {index + 1}
              </div>

              {/* Icon with gradient */}
              <div
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.gradient}`}
              >
                <benefit.icon className="h-7 w-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-bold">{benefit.title}</h3>
              <p className="mb-4 text-muted-foreground">{benefit.description}</p>

              {/* Metric Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {benefit.metric}
              </div>

              {/* Hover glow effect */}
              <div
                className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${benefit.gradient} opacity-0 blur-2xl transition-opacity group-hover:opacity-10`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
