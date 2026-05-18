// Simple admin auth - no sessions, just password check
export const ADMIN_PASSWORD = "benoudis.benjamin@gmail.com!";

export function checkAdminCredentials(_email: string, password: string): boolean {
  return password === ADMIN_PASSWORD;
}
