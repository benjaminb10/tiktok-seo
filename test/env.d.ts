declare module "cloudflare:test" {
  export interface D1Migration {
    name: string;
    queries: string[];
  }

  export const env: Cloudflare.Env & {
    TEST_MIGRATIONS: D1Migration[];
  };
  export function applyD1Migrations(
    db: D1Database,
    migrations: D1Migration[],
  ): Promise<void>;
}
