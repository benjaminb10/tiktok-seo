import { Award, Shield, Star, Users } from "lucide-react";

const trustMetrics = [
  {
    icon: Users,
    value: "5,000+",
    label: "Creators & Agencies",
  },
  {
    icon: Star,
    value: "500,000+",
    label: "Videos Analyzed",
  },
  {
    icon: Award,
    value: "4.9/5",
    label: "User Rating",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Data Privacy",
  },
];

export function TrustBar() {
  return (
    <section className="border-y bg-muted/30 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Trust Text */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-muted-foreground">
              Trusted by leading creators and marketing agencies worldwide
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-6 md:flex md:gap-8 lg:gap-12">
            {trustMetrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center gap-2 text-center md:text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
