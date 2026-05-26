// Extend Cloudflare Env with our custom variables
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    IMAGES: R2Bucket;
    SIDECAR_TOKEN: string;
    ANTHROPIC_API_KEY: string;
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_PRICE_CREATOR_MONTHLY: string;
    STRIPE_PRICE_CREATOR_YEARLY: string;
    STRIPE_PRICE_PRO_MONTHLY: string;
    STRIPE_PRICE_PRO_YEARLY: string;
    STRIPE_PRICE_AGENCY_MONTHLY: string;
    STRIPE_PRICE_AGENCY_YEARLY: string;
  }
}
