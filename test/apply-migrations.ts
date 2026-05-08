import type { D1Migration } from "cloudflare:test";

const { applyD1Migrations, env } = (await import("cloudflare:test")) as {
  applyD1Migrations: (
    db: D1Database,
    migrations: D1Migration[],
  ) => Promise<void>;
  env: {
    DB: D1Database;
    TEST_MIGRATIONS: D1Migration[];
  };
};

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);

export {};
