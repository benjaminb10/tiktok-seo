import { cn } from "#/lib/utils";

type QuotaBadgeProps = {
  used: number;
  limit: number;
  label: string;
  className?: string;
};

export function QuotaBadge({ used, limit, label, className }: QuotaBadgeProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : (used / limit) * 100;
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        isExceeded
          ? "bg-red-500/10 text-red-600 dark:text-red-400"
          : isWarning
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <span>{label}</span>
      <span className="font-semibold">
        {isUnlimited ? (
          <span className="text-green-600 dark:text-green-400">Unlimited</span>
        ) : (
          `${used}/${limit}`
        )}
      </span>
    </div>
  );
}
