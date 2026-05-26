import { createFileRoute } from "@tanstack/react-router";
import { getServerSession } from "#/lib/auth.server";
import { createCheckoutSession } from "#/lib/stripe/stripe.server";
import { TIER_CONFIG, type SubscriptionTier } from "#/lib/stripe/stripe.config";
import { db } from "#/db";
import { user } from "#/db/schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/stripe/checkout")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const session = await getServerSession();

        if (!session) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const body = await request.json();
        const { tier, billing } = body as {
          tier: SubscriptionTier;
          billing: "monthly" | "yearly";
        };

        if (!tier || tier === "free") {
          return new Response(
            JSON.stringify({ error: "Invalid tier selected" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const tierConfig = TIER_CONFIG[tier];
        if (!tierConfig) {
          return new Response(JSON.stringify({ error: "Invalid tier" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const priceId =
          billing === "yearly"
            ? tierConfig.stripePriceIdYearly
            : tierConfig.stripePriceIdMonthly;

        if (!priceId) {
          return new Response(
            JSON.stringify({ error: "Price not configured for this tier" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Get user's Stripe customer ID if exists
        const [userData] = await db
          .select({ stripeCustomerId: user.stripeCustomerId })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);

        const origin = new URL(request.url).origin;

        const checkoutUrl = await createCheckoutSession({
          customerId: userData?.stripeCustomerId || undefined,
          customerEmail: session.user.email,
          priceId,
          userId: session.user.id,
          successUrl: `${origin}/app?checkout=success`,
          cancelUrl: `${origin}/pricing?checkout=canceled`,
        });

        return new Response(JSON.stringify({ url: checkoutUrl }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
