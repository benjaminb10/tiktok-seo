import { createFileRoute } from "@tanstack/react-router";
import { LandingFooter } from "#/components/landing-footer";
import { PricingCards } from "#/features/pricing/pricing-cards";
import { pricingTiers } from "#/features/pricing/pricing-data";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

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
          <PricingCards tiers={pricingTiers} columns={4} />
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
