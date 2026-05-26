import { BarChart3, Download, Eye, Search, Sparkles, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Analyze any profile",
    description:
      "Enter a username and get a full breakdown: engagement rates, best posts, posting patterns, and content themes.",
  },
  {
    icon: TrendingUp,
    title: "Find what works",
    description:
      "See exactly which videos performed best. Understand what hooks, formats, and topics drive the most engagement.",
  },
  {
    icon: Eye,
    title: "Learn from competitors",
    description:
      "Study successful creators in your niche. Discover their strategy and find opportunities they're missing.",
  },
  {
    icon: Sparkles,
    title: "Get AI recommendations",
    description:
      "Our AI analyzes patterns and suggests content ideas based on what's actually working in your niche.",
  },
  {
    icon: BarChart3,
    title: "Track performance",
    description:
      "Compare profiles, track changes over time, and measure what content resonates with your audience.",
  },
  {
    icon: Download,
    title: "Export everything",
    description:
      "Download all data as CSV for your reports, client presentations, or deeper spreadsheet analysis.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header - Solution framing */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">The solution</p>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
            Data-driven decisions, not guesswork
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Stop wondering what content to create. Start knowing.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-background p-6"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <h3 className="mb-2 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
