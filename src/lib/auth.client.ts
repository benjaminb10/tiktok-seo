import { createAuthClient } from "better-auth/client";
import { useState, useEffect, useCallback } from "react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
});

export const { signIn, signOut } = authClient;

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type SessionData = {
  user: SessionUser;
} | null;

// SSR-safe useSession hook - fetches session client-side only
export function useSession() {
  const [data, setData] = useState<SessionData>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      const result = await authClient.getSession();
      if (result.data) {
        setData({
          user: {
            id: result.data.user.id,
            name: result.data.user.name,
            email: result.data.user.email,
            image: result.data.user.image ?? null,
          },
        });
      } else {
        setData(null);
      }
      if (result.error) {
        setError(new Error(result.error.message || "Session error"));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch session"));
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { data, isPending, error, refetch: fetchSession };
}
