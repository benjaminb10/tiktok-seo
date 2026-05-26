import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Try it out",
    features: [
      "1 analysis per day",
      "20 videos per analysis",
      "Basic metrics",
    ],
    cta: "Get started",
    href: "/app",
    highlighted: false,
  },
  {
    name: "Creator",
    price: "29",
    description: "For content creators",
    features: [
      "20 analyses per month",
      "200 videos per analysis",
      "AI insights",
      "CSV export",
    ],
    cta: "Start free trial",
    href: "/pricing",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "79",
    description: "For agencies & brands",
    features: [
      "Unlimited analyses",
      "Unlimited videos",
      "Advanced AI insights",
      "Priority support",
    ],
    cta: "Start free trial",
    href: "/pricing",
    highlighted: false,
  },
];

export function PricingPreviewSection() {
  return (
    <section className="border-t bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
            Pricing
          </h2>
          <p className="text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </div>

        {/* Pricing Cards - Notion style: clean, minimal */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border bg-background p-6 ${
                plan.highlighted ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-semibold text-foreground">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom link */}
        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            See full pricing details →
          </Link>
        </div>
      </div>
    </section>
  );
}
