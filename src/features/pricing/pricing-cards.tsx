import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { PricingTier } from "./pricing-data";

type PricingCardsProps = {
  tiers: PricingTier[];
  columns?: 3 | 4;
};

export function PricingCards({ tiers, columns = 4 }: PricingCardsProps) {
  const gridCols = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <div className={`grid gap-8 md:grid-cols-2 ${gridCols}`}>
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
  );
}
