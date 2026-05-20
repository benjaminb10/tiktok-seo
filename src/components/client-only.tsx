import { useState, useEffect, type ReactNode } from "react";

interface ClientOnlyProps {
  children: () => ReactNode;
  fallback?: ReactNode;
}

/**
 * Renders children only on the client side to avoid hydration mismatches.
 * The children prop is a function to ensure it's not evaluated during SSR.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server and initial client render: show fallback
  // This ensures hydration matches
  if (!mounted) {
    return <>{fallback}</>;
  }

  // After hydration, render children
  return <>{children()}</>;
}
