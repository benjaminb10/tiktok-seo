import { BarChart3, Compass, FileDown, HelpCircle, LayoutDashboard, ListVideo, Settings } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SidebarFooter = lazy(() =>
  import("#/components/sidebar-footer.client").then((m) => ({ default: m.SidebarFooter }))
);

function SidebarFooterFallback() {
  return (
    <div className="border-t p-3">
      <div className="h-7" />
    </div>
  );
}

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
          <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Viewlify</span>.app
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
      <Suspense fallback={<SidebarFooterFallback />}>
        <SidebarFooter />
      </Suspense>
    </div>
  );
}
