import { BarChart3 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-violet-500">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Viewlify</span>.app
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              The leading TikTok analytics tool for creators, agencies, and brands.
              AI-powered insights to help you understand and replicate viral success.
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Viewlify.app. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/app" className="text-muted-foreground hover:text-foreground">
                  Analyzer
                </Link>
              </li>
              <li>
                <Link to="/profiles" className="text-muted-foreground hover:text-foreground">
                  Discover Creators
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </a>
              </li>
              <li>
                <a href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </a>
              </li>
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
        <div className="mt-12 border-t pt-8">
          <div className="flex items-center justify-center gap-4">
            <p className="text-center text-xs text-muted-foreground">
              Not affiliated with TikTok. All trademarks are property of their respective owners.
            </p>
            <Link
              to="/admin"
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              •
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
