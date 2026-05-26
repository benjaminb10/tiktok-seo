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
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Why Do Some TikTok Videos Get 10M Views While Yours Get 100?
          </h2>
          <p className="text-lg text-muted-foreground">
            Most creators are flying blind. Here's why that's a problem.
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Problems */}
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                The Problem
              </div>
              <h3 className="text-xl font-semibold text-foreground">Without proper analytics</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem) => (
                <li key={problem.text} className="flex items-start gap-3">
                  <problem.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                  <span className="text-muted-foreground">{problem.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                The Solution
              </div>
              <h3 className="text-xl font-semibold text-foreground">With Viewlify</h3>
            </div>
            <ul className="space-y-4">
              {solutions.map((solution) => (
                <li key={solution.text} className="flex items-start gap-3">
                  <solution.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span className="text-muted-foreground">{solution.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-foreground">
            Stop guessing. Start growing.
          </p>
        </div>
      </div>
    </section>
  );
}
