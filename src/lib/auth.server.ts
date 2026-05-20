import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { db } from "#/db";

// Lazy initialization to avoid issues with env access at module load time
let _auth: ReturnType<typeof betterAuth> | null = null;

function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
      secret: env.BETTER_AUTH_SECRET,
      baseURL:
        process.env.NODE_ENV === "production"
          ? "https://viewlify.app"
          : "http://localhost:3000",
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },
      plugins: [tanstackStartCookies()],
    });
  }
  return _auth;
}

export const auth = {
  get handler() {
    return getAuth().handler;
  },
  get api() {
    return getAuth().api;
  },
};

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
};

/**
 * Get the current session from server-side context.
 * Returns null if not authenticated.
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const headers = getRequestHeaders();
    const session = await getAuth().api.getSession({ headers });
    return session;
  } catch {
    return null;
  }
}
