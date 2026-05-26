import { useNavigate } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { useSession } from "#/lib/auth.client";
import type { PricingTier } from "./pricing-data";

type PricingCardsProps = {
  tiers: PricingTier[];
  columns?: 3 | 4;
  billing?: "monthly" | "yearly";
};

export function PricingCards({
  tiers,
  columns = 4,
  billing = "monthly",
}: PricingCardsProps) {
  const gridCols = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.id === "free") {
      navigate({ to: "/app" });
      return;
    }

    if (tier.isContactSales) {
      window.location.href = "mailto:contact@viewlify.app?subject=Agency%20Plan%20Inquiry";
      return;
    }

    if (!session?.user) {
      navigate({ to: "/login", search: { redirect: "/pricing" } });
      return;
    }

    setLoadingTier(tier.id);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tier.id, billing }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className={`grid gap-8 md:grid-cols-2 ${gridCols}`}>
      {tiers.map((tier) => {
        const displayPrice =
          billing === "yearly" && tier.yearlyPrice
            ? tier.yearlyPrice
            : tier.price;
        const isLoading = loadingTier === tier.id;

        return (
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
                <span className="text-4xl font-bold">${displayPrice}</span>
                {displayPrice !== "0" && (
                  <span className="text-muted-foreground">/month</span>
                )}
                {billing === "yearly" && tier.yearlyPrice && (
                  <div className="mt-1 text-xs text-green-600">
                    Save ${(Number(tier.price) - Number(tier.yearlyPrice)) * 12}/year
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </div>

            {/* CTA */}
            <Button
              className="mb-6 w-full"
              variant={tier.highlighted ? "default" : "outline"}
              onClick={() => handleSubscribe(tier)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                tier.cta
              )}
            </Button>

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
        );
      })}
    </div>
  );
}
