import { createFileRoute } from "@tanstack/react-router";
import { constructWebhookEvent } from "#/lib/stripe/stripe.server";
import { getTierFromPriceId } from "#/lib/stripe/stripe.config";
import { db } from "#/db";
import { user, subscriptions } from "#/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type Stripe from "stripe";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const signature = request.headers.get("stripe-signature");

        if (!signature) {
          return new Response(
            JSON.stringify({ error: "Missing stripe-signature header" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const payload = await request.text();

        let event: Stripe.Event;
        try {
          event = constructWebhookEvent(payload, signature);
        } catch (err) {
          console.error("Webhook signature verification failed:", err);
          return new Response(
            JSON.stringify({ error: "Invalid signature" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        try {
          switch (event.type) {
            case "checkout.session.completed":
              await handleCheckoutCompleted(
                event.data.object as Stripe.Checkout.Session,
              );
              break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
              await handleSubscriptionUpsert(
                event.data.object as Stripe.Subscription,
              );
              break;

            case "customer.subscription.deleted":
              await handleSubscriptionDeleted(
                event.data.object as Stripe.Subscription,
              );
              break;

            case "invoice.payment_failed":
              await handlePaymentFailed(event.data.object as Stripe.Invoice);
              break;

            default:
              console.log(`Unhandled event type: ${event.type}`);
          }

          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Error processing webhook:", err);
          return new Response(
            JSON.stringify({ error: "Webhook processing failed" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  if (!userId || !customerId) {
    console.error("Missing userId or customerId in checkout session");
    return;
  }

  // Update user with Stripe customer ID
  await db
    .update(user)
    .set({
      stripeCustomerId: customerId,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  console.log(`Checkout completed for user ${userId}, customer ${customerId}`);
}

async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const customerId = subscription.customer as string;

  if (!userId) {
    // Try to find user by customer ID
    const [userData] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.stripeCustomerId, customerId))
      .limit(1);

    if (!userData) {
      console.error(
        `Cannot find user for subscription ${subscription.id}, customer ${customerId}`,
      );
      return;
    }

    // Update subscription with userId
    const resolvedUserId = userData.id;
    await upsertSubscription(subscription, resolvedUserId, customerId);
    return;
  }

  await upsertSubscription(subscription, userId, customerId);
}

async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId: string,
  customerId: string,
) {
  const priceId = subscription.items.data[0]?.price.id;
  const tier = priceId ? getTierFromPriceId(priceId) : null;

  console.log(`[Webhook] Processing subscription:`, {
    subscriptionId: subscription.id,
    userId,
    customerId,
    priceId,
    tier,
    status: subscription.status,
  });

  const now = new Date();

  // Check if subscription exists
  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  // Access period times from subscription (type assertion needed for some Stripe SDK versions)
  const sub = subscription as Stripe.Subscription & {
    current_period_start: number;
    current_period_end: number;
  };

  const subscriptionData = {
    userId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId || "",
    stripeCustomerId: customerId,
    status: subscription.status as typeof subscriptions.$inferSelect.status,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: now,
  };

  if (existing) {
    await db
      .update(subscriptions)
      .set(subscriptionData)
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      id: nanoid(),
      ...subscriptionData,
      createdAt: now,
    });
  }

  // Update user tier if subscription is active
  if (subscription.status === "active" || subscription.status === "trialing") {
    await db
      .update(user)
      .set({
        tier: tier || "free",
        stripeCustomerId: customerId,
        updatedAt: now,
      })
      .where(eq(user.id, userId));
  }

  console.log(
    `Subscription ${subscription.id} upserted for user ${userId}, tier: ${tier}`,
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by customer ID
  const [userData] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.stripeCustomerId, customerId))
    .limit(1);

  if (userData) {
    // Reset user to free tier
    await db
      .update(user)
      .set({
        tier: "free",
        updatedAt: new Date(),
      })
      .where(eq(user.id, userData.id));
  }

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(
    `Subscription ${subscription.id} deleted, user reset to free tier`,
  );
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  console.log(`Payment failed for customer ${customerId}`);

  // Optional: Send notification to user, update status, etc.
  // For now, Stripe's dunning process will handle retries
}
