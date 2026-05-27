import { ArrowRight, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { useState } from "react";

export function HeroSection() {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <section className="relative py-20 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 text-center">
        {/* Badge - honest positioning */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-foreground">
            Free TikTok analytics tool
          </span>
        </div>

        {/* Title - Clear value proposition */}
        <h1 className="mb-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Understand why some TikToks
          <br />
          <span className="text-primary">go viral</span>
        </h1>

        {/* Subtitle - Specific benefit */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl">
          Analyze any TikTok profile in seconds. See which videos perform best,
          discover content patterns, and get ideas for your next viral video.
        </p>

        {/* CTA - Single clear action */}
        <div className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/app">
            <Button size="lg" className="h-12 px-8 text-base">
              Analyze a profile for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            No signup required
          </p>
        </div>

        {/* Screenshot - Clean presentation */}
        <div className="relative mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl border bg-background shadow-2xl shadow-primary/5">
            <div className="border-b bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
                  viewlify.app
                </div>
              </div>
            </div>
            <div className="p-6 lg:p-8">
              {/* Mini app preview */}
              <div className="space-y-6">
                {/* Search bar mockup */}
                <div className="mx-auto flex max-w-xl items-center gap-3 rounded-lg border bg-background p-3">
                  {avatarError ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      MB
                    </div>
                  ) : (
                    <img
                      src="/api/avatar/mrbeast"
                      alt="MrBeast avatar"
                      className="h-8 w-8 rounded-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                  <span className="text-sm font-medium text-foreground">@mrbeast</span>
                  <div className="ml-auto rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
                    Analyze
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Videos", value: "847" },
                    { label: "Avg Views", value: "52M" },
                    { label: "Engagement", value: "4.8%" },
                    { label: "Top Video", value: "312M" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border bg-background p-4 text-center">
                      <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Video list mockup */}
                <div className="space-y-2">
                  {[
                    { title: "$456,000 Squid Game In Real Life!", views: "312M" },
                    { title: "I Built 100 Wells In Africa", views: "187M" },
                    { title: "Ages 1-100 Decide Who Wins $250,000", views: "156M" },
                  ].map((video) => (
                    <div key={video.title} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                      <div className="h-12 w-12 shrink-0 rounded-md bg-gradient-to-br from-muted to-muted/50" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{video.title}</div>
                        <div className="text-xs text-muted-foreground">TikTok video</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">{video.views}</div>
                        <div className="text-xs text-muted-foreground">views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
