import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "./button";
import { cn } from "#/lib/utils";

interface PremiumBlurProps {
  children: React.ReactNode;
  isLocked: boolean;
  label?: string;
  className?: string;
  /** Use inline for table cells */
  inline?: boolean;
}

export function PremiumBlur({
  children,
  isLocked,
  label = "Upgrade",
  className,
  inline = false,
}: PremiumBlurProps) {
  if (!isLocked) return <>{children}</>;

  if (inline) {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        <span className="blur-sm select-none" aria-hidden>
          {children}
        </span>
        <Link
          to="/pricing"
          className="text-xs text-muted-foreground hover:text-primary"
        >
          <Lock className="h-3 w-3" />
        </Link>
      </span>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="blur-md select-none pointer-events-none" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
        <Button variant="outline" size="sm" asChild>
          <Link to="/pricing" className="gap-1.5">
            <Lock className="h-3 w-3" />
            {label}
          </Link>
        </Button>
      </div>
    </div>
  );
}
