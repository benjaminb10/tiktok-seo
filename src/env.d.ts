// Extend Cloudflare Env with our custom variables
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    SIDECAR_TOKEN: string;
    ANTHROPIC_API_KEY: string;
    BETTER_AUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    STRIPE_PUBLISHABLE_KEY: string;
  }
}
