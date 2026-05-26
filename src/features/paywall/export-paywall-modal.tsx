import { Download, FileSpreadsheet, Sparkles } from "lucide-react";
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

type ExportPaywallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportPaywallModal({
  open,
  onOpenChange,
}: ExportPaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Export your data
          </DialogTitle>
          <DialogDescription className="text-center">
            CSV export is available from the Creator plan.
            Download all your analyses to use in Excel, Google Sheets, or your favorite tool.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-3 text-sm font-medium">
              With CSV export, you can:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span>Download all analyzed videos</span>
              </li>
              <li className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span>Complete stats: views, likes, engagement...</span>
              </li>
              <li className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span>Transcriptions and hashtags included</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full">
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
