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
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
            Built for Everyone Growing on TikTok
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're a solo creator or managing an agency, Viewlify scales with you
          </p>
        </div>

        {/* Use Cases */}
        <div className="grid gap-6 lg:grid-cols-3">
          {useCases.map((useCase) => (
            <div
              key={useCase.role}
              className="rounded-lg border bg-background p-6"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <useCase.icon className="h-5 w-5 text-foreground" />
              </div>

              {/* Role */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">{useCase.role}</h3>

              {/* Challenge */}
              <p className="mb-3 text-sm text-muted-foreground">
                <span className="text-destructive">Challenge:</span> {useCase.challenge}
              </p>

              {/* Solution */}
              <p className="mb-5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Solution:</span>{" "}
                {useCase.solution}
              </p>

              {/* Results */}
              <div className="space-y-2 rounded-md bg-muted/50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Typical Results
                </div>
                <ul className="space-y-1.5">
                  {useCase.results.map((result) => (
                    <li
                      key={result}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-0.5 text-primary">✓</span>
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
