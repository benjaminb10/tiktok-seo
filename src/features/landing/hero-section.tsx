import { ArrowRight, CheckCircle2, Play, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { AppScreenshot } from "./app-screenshot";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20">
      {/* Optimized Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50/50 via-violet-50/50 to-background dark:from-pink-950/20 dark:via-violet-950/20" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Single optimized blur orb */}
      <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-400 opacity-10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge - SEO optimized */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="font-medium text-muted-foreground">
              #1 TikTok Analytics Tool Used by 5,000+ Creators
            </span>
          </div>

          {/* Title - SEO optimized H1 */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            TikTok Analytics Tool That Reveals{" "}
            <span className="bg-gradient-to-r from-pink-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Why Videos Go Viral
            </span>
          </h1>

          {/* Subtitle - Key value props */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            Analyze any TikTok profile in 30 seconds. Get AI-powered insights on
            viral hooks, engagement patterns, and content strategies that generate{" "}
            <span className="font-semibold text-foreground">10M+ views</span>.
          </p>

          {/* CTA Buttons */}
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/app">
              <Button size="lg" className="group h-14 px-8 text-lg shadow-lg">
                Analyze Your First Profile Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="#features">
              <Button
                size="lg"
                variant="outline"
                className="h-14 gap-2 px-8 text-lg"
              >
                <Play className="h-5 w-5" />
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">5,000+</span>{" "}
                creators & agencies
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">500,000+</span>{" "}
                videos analyzed
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium text-foreground">
                No credit card required
              </span>
            </div>
          </div>
        </div>

        {/* Screenshot preview - Enhanced */}
        <div className="mt-16 sm:mt-20">
          <div className="relative mx-auto max-w-6xl">
            {/* Glow effect - optimized */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-pink-500/10 via-violet-500/10 to-purple-500/10 blur-2xl" />

            {/* Screenshot */}
            <div className="overflow-hidden rounded-2xl border-2 border-border bg-background shadow-2xl">
              <div className="aspect-video w-full bg-gradient-to-br from-muted/50 to-background p-4 sm:p-8">
                <AppScreenshot />
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-1/4 hidden rounded-xl border bg-background p-4 shadow-lg lg:block">
              <div className="mb-1 text-2xl font-bold text-green-500">+350%</div>
              <div className="text-xs text-muted-foreground">Avg Growth</div>
            </div>
            <div className="absolute -right-4 top-1/3 hidden rounded-xl border bg-background p-4 shadow-lg lg:block">
              <div className="mb-1 text-2xl font-bold text-violet-500">10M+</div>
              <div className="text-xs text-muted-foreground">Videos Analyzed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
