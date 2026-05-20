// Simple admin auth - no sessions, just password check
// TODO: Replace with Better Auth session check once auth is fully integrated
export const ADMIN_PASSWORD = "benoudis.benjamin@gmail.com!";

export function checkAdminCredentials(_email: string, password: string): boolean {
  return password === ADMIN_PASSWORD;
}
