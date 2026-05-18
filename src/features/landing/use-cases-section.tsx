import { Briefcase, Sparkles, Users } from "lucide-react";

const useCases = [
  {
    icon: Sparkles,
    role: "Content Creators",
    challenge: "Struggling to grow or maintain consistency",
    solution:
      "Analyze your top-performing videos to understand what works. Replicate successful patterns and avoid content that flops. Get AI recommendations for your next viral video.",
    results: [
      "Grow from 10K to 500K followers in 6 months",
      "3x average views per video",
      "Consistent viral content formula",
    ],
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Briefcase,
    role: "Marketing Agencies",
    challenge: "Managing multiple clients with limited resources",
    solution:
      "Quickly analyze competitor landscapes for clients. Generate comprehensive reports with analytics and insights. Prove ROI with data-backed content strategies.",
    results: [
      "Manage 10+ clients efficiently",
      "Deliver professional analytics reports",
      "Increase client retention by 40%",
    ],
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    role: "Brands & Businesses",
    challenge: "Building TikTok presence from scratch",
    solution:
      "Research your industry's viral content patterns. Find and analyze potential brand ambassadors. Track campaign performance and competitor activity in real-time.",
    results: [
      "Launch successful TikTok strategy",
      "Identify high-performing creators",
      "Beat competitors to trending topics",
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
];

export function UseCasesSection() {
  return (
    <section className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for Everyone Growing on TikTok
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're a solo creator or managing an agency, Viewlify scales with you
          </p>
        </div>

        {/* Use Cases */}
        <div className="grid gap-8 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.role}
              className="relative rounded-2xl border bg-background p-8"
            >
              {/* Icon */}
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${useCase.gradient}`}
              >
                <useCase.icon className="h-7 w-7 text-white" />
              </div>

              {/* Role */}
              <h3 className="mb-2 text-2xl font-bold">{useCase.role}</h3>

              {/* Challenge */}
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                <span className="text-red-500">Challenge:</span> {useCase.challenge}
              </p>

              {/* Solution */}
              <p className="mb-6 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Solution:</span>{" "}
                {useCase.solution}
              </p>

              {/* Results */}
              <div className="space-y-2 rounded-xl bg-muted/50 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Typical Results
                </div>
                <ul className="space-y-1.5">
                  {useCase.results.map((result) => (
                    <li
                      key={result}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-1 text-green-500">✓</span>
                      {result}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
