import { Clock, Eye, HelpCircle } from "lucide-react";

const problems = [
  {
    icon: HelpCircle,
    title: "You don't know what works",
    description:
      "You post videos but have no idea why some get views and others don't. TikTok's native analytics are limited and confusing.",
  },
  {
    icon: Eye,
    title: "Competitors seem to have a secret",
    description:
      "Other creators in your niche are growing faster. You want to understand their strategy but manually checking their videos takes forever.",
  },
  {
    icon: Clock,
    title: "Hours wasted on guesswork",
    description:
      "Without data, you're just guessing. You spend time creating content that doesn't perform, instead of doubling down on what actually works.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-t py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium text-primary">The problem</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Growing on TikTok is hard without data
          </h2>
        </div>

        {/* Problems grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((problem) => (
            <div key={problem.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <problem.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">
                {problem.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
