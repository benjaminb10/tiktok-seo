import { BarChart3 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">Viewlify</span>
            </Link>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              TikTok analytics tool. Analyze any profile and discover what content performs best.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/app" className="text-muted-foreground hover:text-foreground">
                  Analyzer
                </Link>
              </li>
              <li>
                <Link to="/profiles" className="text-muted-foreground hover:text-foreground">
                  Discover
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Statistics</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/stats/engagement" className="text-muted-foreground hover:text-foreground">
                  Engagement Analysis
                </Link>
              </li>
              <li>
                <Link to="/stats/top-creators" className="text-muted-foreground hover:text-foreground">
                  Top Creators
                </Link>
              </li>
              <li>
                <Link to="/stats/rising-stars" className="text-muted-foreground hover:text-foreground">
                  Rising Stars
                </Link>
              </li>
            </ul>
          </div>

          {/* Free Tools */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Free Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tools/tiktok-engagement-calculator" className="text-muted-foreground hover:text-foreground">
                  Engagement Calculator
                </Link>
              </li>
              <li>
                <Link to="/tools/tiktok-money-calculator" className="text-muted-foreground hover:text-foreground">
                  Money Calculator
                </Link>
              </li>
              <li>
                <Link to="/tools/tiktok-hashtag-generator" className="text-muted-foreground hover:text-foreground">
                  AI Hashtag Generator
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-muted-foreground hover:text-foreground">
                  View All Tools →
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Viewlify. Not affiliated with TikTok.
          </p>
          <Link
            to="/admin"
            className="text-xs text-muted-foreground/30 transition-colors hover:text-muted-foreground"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
