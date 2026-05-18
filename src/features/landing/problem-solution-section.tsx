import { AlertCircle, CheckCircle2, Clock, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: AlertCircle,
    text: "Can't see what makes competitors' videos go viral",
  },
  {
    icon: Clock,
    text: "Waste hours guessing which content will work",
  },
  {
    icon: TrendingDown,
    text: "Miss trending formats until they're saturated",
  },
];

const solutions = [
  {
    icon: CheckCircle2,
    text: "Reverse-engineer viral success in 30 seconds",
  },
  {
    icon: CheckCircle2,
    text: "Get AI-powered insights on proven viral patterns",
  },
  {
    icon: CheckCircle2,
    text: "Spot trends before your competitors do",
  },
];

export function ProblemSolutionSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Why Do Some TikTok Videos Get{" "}
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              10M Views
            </span>{" "}
            While Yours Get 100?
          </h2>
          <p className="text-lg text-muted-foreground">
            Most creators are flying blind. Here's why that's a problem.
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Problems */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                The Problem
              </div>
              <h3 className="text-2xl font-bold">Without proper analytics</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem) => (
                <li key={problem.text} className="flex items-start gap-3">
                  <problem.icon className="mt-1 h-5 w-5 flex-shrink-0 text-red-500" />
                  <span className="text-muted-foreground">{problem.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="rounded-2xl border border-green-200 bg-green-50/50 p-8 dark:border-green-900/50 dark:bg-green-950/20">
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4" />
                The Solution
              </div>
              <h3 className="text-2xl font-bold">With Viewlify.ai</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((solution) => (
                <li key={solution.text} className="flex items-start gap-3">
                  <solution.icon className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-muted-foreground">{solution.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg font-medium">
            Stop guessing. Start growing.
          </p>
        </div>
      </div>
    </section>
  );
}
