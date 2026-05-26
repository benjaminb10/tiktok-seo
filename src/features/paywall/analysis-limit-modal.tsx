import { Lock, Zap, TrendingUp, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { Progress } from "#/components/ui/progress";

type AnalysisLimitModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
  isAuthenticated: boolean;
};

export function AnalysisLimitModal({
  open,
  onOpenChange,
  used,
  limit,
  isAuthenticated,
}: AnalysisLimitModalProps) {
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/10">
            <Lock className="h-6 w-6 text-pink-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isAuthenticated
              ? "Analysis limit reached"
              : "Sign in to continue"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isAuthenticated
              ? "You've used all your analyses this month. Upgrade to continue."
              : "Create a free account to save your analyses and unlock more."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Analyses this month</span>
              <span className="font-semibold">
                {used}/{limit}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Upgrade to Creator to unlock:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-pink-500" />
                <span>20 analyses per month</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-pink-500" />
                <span>200 videos per analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-pink-500" />
                <span>Unlimited CSV export</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {isAuthenticated ? (
            <>
              <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600">
                <Link to="/pricing">
                  <Zap className="mr-2 h-4 w-4" />
                  View plans
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Maybe later
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600">
                <a href="/api/auth/signin/google">
                  Create free account
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/pricing">
                  View plans
                </Link>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
