import { ArrowRight, BarChart3, Lightbulb, Search, Zap } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Paste Any Profile",
    description: "Enter a @username or TikTok URL. Works with any public profile.",
    duration: "5 seconds",
    step: "1",
  },
  {
    icon: BarChart3,
    title: "AI Analyzes Everything",
    description: "Our AI scans videos, hooks, engagement patterns, and viral signals.",
    duration: "15 seconds",
    step: "2",
  },
  {
    icon: Lightbulb,
    title: "Get Actionable Insights",
    description: "Receive detailed reports on what works and specific recommendations.",
    duration: "10 seconds",
    step: "3",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Zap className="h-4 w-4 text-violet-500" />
            <span className="text-muted-foreground">
              Get insights in under 30 seconds
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Dead Simple. Lightning Fast.
          </h2>
          <p className="text-lg text-muted-foreground">
            From zero to viral insights in 3 easy steps
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Step card */}
                <div className="group relative rounded-2xl border bg-background p-8 transition-all hover:shadow-lg hover:shadow-violet-500/10">
                  {/* Step number */}
                  <div className="absolute -left-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-lg font-bold text-white shadow-lg">
                    {step.step}
                  </div>

                  {/* Duration badge */}
                  <div className="absolute -right-3 -top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-md">
                    {step.duration}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50">
                    <step.icon className="h-7 w-7 text-violet-500" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Hover glow */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-pink-500/0 to-violet-500/0 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-violet-500 md:block">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom emphasis */}
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold">
            Total time: <span className="text-violet-500">30 seconds</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            From profile URL to actionable insights faster than making coffee ☕
          </p>
        </div>
      </div>
    </section>
  );
}
