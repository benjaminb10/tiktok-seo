import { Sparkles, Bot, Zap } from "lucide-react";
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

type AiQuotaModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used: number;
  limit: number;
};

export function AiQuotaModal({
  open,
  onOpenChange,
  used,
  limit,
}: AiQuotaModalProps) {
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
            <Bot className="h-6 w-6 text-violet-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            AI insights limit reached
          </DialogTitle>
          <DialogDescription className="text-center">
            You've used your free AI insight this month.
            Upgrade to Creator for unlimited AI analyses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Insights this month</span>
              <span className="font-semibold">
                {used}/{limit}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              With Creator, unlock:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span>Unlimited AI analyses</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-500" />
                <span>Personalized insights for your videos</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-violet-500" />
                <span>Tips to improve your engagement</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600">
            <Link to="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Creator - $29/mo
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
