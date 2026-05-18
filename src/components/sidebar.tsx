import { BarChart3, Compass, FileDown, HelpCircle, LayoutDashboard, ListVideo, Settings } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analyses", href: "/analyses", icon: ListVideo },
  { name: "Discover", href: "/profiles", icon: Compass },
  { name: "Exports", href: "/exports", icon: FileDown },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-violet-500">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none">
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Viewlify</span>.ai
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500">
            <span className="text-xs font-semibold text-white">V</span>
          </div>
          <div className="flex flex-col text-xs">
            <span className="font-medium">Viewlify.ai</span>
            <span className="text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
