import { createFileRoute } from "@tanstack/react-router";
import { getServerSession } from "#/lib/auth.server";
import { createCustomerPortalSession } from "#/lib/stripe/stripe.server";
import { db } from "#/db";
import { user } from "#/db/schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/stripe/portal")({
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

        // Get user's Stripe customer ID
        const [userData] = await db
          .select({ stripeCustomerId: user.stripeCustomerId })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);

        if (!userData?.stripeCustomerId) {
          return new Response(
            JSON.stringify({ error: "No active subscription found" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const origin = new URL(request.url).origin;

        const portalUrl = await createCustomerPortalSession({
          customerId: userData.stripeCustomerId,
          returnUrl: `${origin}/settings`,
        });

        return new Response(JSON.stringify({ url: portalUrl }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
