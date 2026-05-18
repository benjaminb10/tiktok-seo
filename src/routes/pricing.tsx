import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { LandingFooter } from "#/components/landing-footer";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const tiers = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out Viewlify.ai",
    features: [
      "1 analysis per day",
      "20 videos max per analysis",
      "Basic stats & insights",
      "7-day history",
      "Watermark on shares",
    ],
    cta: "Start for free",
    highlighted: false,
  },
  {
    name: "Creator",
    price: "29",
    description: "For solo creators and influencers",
    features: [
      "20 analyses per month",
      "200 videos max per analysis",
      "AI-powered insights",
      "CSV & PDF exports",
      "3-month history",
      "Compare 2 accounts",
      "No watermark",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "79",
    description: "For agencies and brands",
    features: [
      "Unlimited analyses",
      "Unlimited videos",
      "Advanced AI insights",
      "Competitor tracking (10 accounts)",
      "Email & Slack alerts",
      "Multi-account comparison (5)",
      "Automated reports",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Agency",
    price: "199",
    description: "For large teams and agencies",
    features: [
      "Everything in Pro",
      "Multi-workspaces (5 teams)",
      "White-label branding",
      "API access",
      "Webhooks",
      "Dedicated account manager",
      "Custom integrations",
      "SLA 99.9%",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-gradient-to-br from-pink-50 via-violet-50 to-background py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Start free, upgrade anytime. No credit card required.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 ${
                  tier.highlighted
                    ? "border-primary shadow-lg shadow-primary/20"
                    : "bg-background"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-1 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-bold">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    {tier.price !== "0" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                {/* CTA */}
                <Link to="/app">
                  <Button
                    className="mb-6 w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
                </Link>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">
                Can I change plans anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">
                What happens if I exceed my limits?
              </h3>
              <p className="text-muted-foreground">
                You'll receive a notification when approaching your limits. You can
                upgrade anytime to continue analyzing.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">
                Is there a free trial?
              </h3>
              <p className="text-muted-foreground">
                Yes, all paid plans include a 7-day free trial. No credit card
                required.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">
                What's your refund policy?
              </h3>
              <p className="text-muted-foreground">
                We offer a 14-day money-back guarantee on all paid plans, no
                questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
