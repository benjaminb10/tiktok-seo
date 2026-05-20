import { Eye, Heart, MessageCircle, Play, Search, Sparkles, TrendingUp } from "lucide-react";

export function AppScreenshot() {
  return (
    <div className="aspect-video w-full rounded-lg border-2 border-border bg-gradient-to-br from-background to-muted/50 p-3 sm:p-6">
      {/* Mock browser chrome */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground">
          🔒 viewlify.app/app/@charlidamelio
        </div>
      </div>

      {/* Mock app content */}
      <div className="space-y-3">
        {/* Search bar with profile */}
        <div className="rounded-xl border bg-background p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-1 items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-400 to-violet-400" />
              <div className="text-sm font-medium">@charlidamelio</div>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-1.5">
              <Sparkles className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">Analyze</span>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Play, label: "Videos", value: "2,456", color: "from-pink-500 to-rose-500" },
            { icon: Eye, label: "Avg Views", value: "8.2M", color: "from-blue-500 to-cyan-500" },
            { icon: Heart, label: "Engagement", value: "12.4%", color: "from-red-500 to-pink-500" },
            { icon: TrendingUp, label: "Growth", value: "+24%", color: "from-green-500 to-emerald-500" },
          ].map((stat, i) => (
            <div key={i} className="rounded-lg border bg-background p-2 shadow-sm">
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[0.65rem] font-medium text-muted-foreground">
                  {stat.label}
                </div>
                <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-sm font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Top Videos Table */}
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="border-b bg-muted/30 px-3 py-2">
            <div className="text-xs font-semibold">Top Performing Videos</div>
          </div>
          <div className="space-y-1.5 p-2">
            {[
              { views: "45.2M", engagement: "18.3%", viral: true },
              { views: "32.8M", engagement: "15.7%", viral: true },
              { views: "28.4M", engagement: "14.2%", viral: false },
            ].map((video, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-pink-300 via-violet-300 to-purple-300">
                  <Play className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 h-2 w-full rounded-full bg-muted/70" />
                  <div className="h-1.5 w-2/3 rounded-full bg-muted/50" />
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[0.65rem] font-semibold">{video.views}</span>
                  </div>
                  {video.viral && (
                    <div className="rounded-full bg-green-500 px-1.5 py-0.5 text-[0.55rem] font-medium text-white">
                      VIRAL
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
