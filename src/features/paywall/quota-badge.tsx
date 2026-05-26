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
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
        isExceeded
          ? "bg-destructive/10 text-destructive"
          : isWarning
          ? "bg-amber-500/10 text-amber-600"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <span>{label}</span>
      <span className="font-semibold">
        {isUnlimited ? (
          <span className="text-green-600">Unlimited</span>
        ) : (
          `${used}/${limit}`
        )}
      </span>
    </div>
  );
}
