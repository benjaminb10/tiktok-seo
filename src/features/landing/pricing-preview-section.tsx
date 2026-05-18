import { Link } from "@tanstack/react-router";
import { PricingCards } from "#/features/pricing/pricing-cards";
import { pricingTiers } from "#/features/pricing/pricing-data";

export function PricingPreviewSection() {
  // Show only first 3 tiers on landing page
  const previewTiers = pricingTiers.slice(0, 3);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <PricingCards tiers={previewTiers} columns={3} />

        {/* Bottom Note */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            All plans include 14-day money-back guarantee • Cancel anytime
          </p>
          <Link
            to="/pricing"
            className="inline-block text-sm font-medium text-primary hover:underline"
          >
            View all plans and features →
          </Link>
        </div>
      </div>
    </section>
  );
}
