import { Search, BarChart3, Sparkles } from "lucide-react";
import { Card } from "#/components/ui/card";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

type WelcomeSectionProps = {
  user: User;
};

const steps = [
  {
    icon: Search,
    title: "Enter a TikTok username",
    description: "Paste any @username or profile URL",
  },
  {
    icon: BarChart3,
    title: "We analyze the videos",
    description: "Get stats on views, likes, engagement",
  },
  {
    icon: Sparkles,
    title: "Discover insights",
    description: "See what content performs best",
  },
];

export function WelcomeSection({ user }: WelcomeSectionProps) {
  return (
    <div className="space-y-6">
      {/* How it works */}
      <Card className="p-6">
        <h2 className="mb-6 text-center text-sm font-medium text-muted-foreground uppercase tracking-wide">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                Step {index + 1}
              </div>
              <h3 className="font-medium text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Example Preview */}
      <Card className="overflow-hidden">
        <div className="border-b bg-muted/50 px-4 py-2">
          <span className="text-xs text-muted-foreground">Example analysis</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 text-white font-bold">
              M
            </div>
            <div>
              <div className="font-medium">@mrbeast</div>
              <div className="text-xs text-muted-foreground">Example profile</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Videos", value: "847" },
              { label: "Avg Views", value: "52M" },
              { label: "Engagement", value: "4.8%" },
              { label: "Top Video", value: "312M" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-background p-3 text-center">
                <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
