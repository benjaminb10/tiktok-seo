import { BarChart3, Bot, Eye, Target, TrendingUp, Zap } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Viral Pattern Recognition",
    description:
      "Our AI analyzed 10M+ viral TikToks to identify the exact hooks, formats, and patterns that capture attention in the first 3 seconds.",
    benefit: "See exactly what makes videos explode",
    proof: "Trained on 10M+ viral videos",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    title: "Deep Performance Analytics",
    description:
      "Track views, engagement rate, viral velocity, and 20+ metrics that TikTok doesn't show you. Export everything to CSV for your reports.",
    benefit: "Make data-driven content decisions",
    proof: "20+ advanced metrics",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    title: "Competitor Intelligence",
    description:
      "Analyze any competitor profile in 30 seconds. See their top-performing videos, viral patterns, and content gaps you can exploit.",
    benefit: "Steal what's working for others",
    proof: "Analyze unlimited profiles",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "First 3-Second Hook Analysis",
    description:
      "The first 3 seconds make or break a video. Our AI identifies which opening hooks drive the highest retention and engagement.",
    benefit: "Master the viral hook formula",
    proof: "Based on retention data",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Bot,
    title: "AI Content Recommendations",
    description:
      "Get personalized suggestions on topics, formats, and posting times based on your niche and audience. Stop guessing, start growing.",
    benefit: "Know what to post next",
    proof: "Personalized for your niche",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Eye,
    title: "Early Trend Detection",
    description:
      "Spot emerging trends 2 weeks before they peak. Be the first to ride the wave while others are still catching up.",
    benefit: "Stay ahead of the curve",
    proof: "2 weeks before saturation",
    gradient: "from-fuchsia-500 to-pink-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful Features Built for Growth
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to analyze, understand, and replicate viral TikTok success
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border bg-background p-8 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Icon with gradient */}
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {feature.description}
              </p>

              {/* Benefit */}
              <div className="mb-3 text-sm font-medium text-foreground">
                → {feature.benefit}
              </div>

              {/* Proof Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {feature.proof}
              </div>

              {/* Hover effect */}
              <div
                className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-xl transition-opacity group-hover:opacity-20`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
