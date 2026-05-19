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
    <div className="flex h-screen w-44 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-violet-500">
          <BarChart3 className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold">
          <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Viewlify</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500">
            <span className="text-xs font-semibold text-white">V</span>
          </div>
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
