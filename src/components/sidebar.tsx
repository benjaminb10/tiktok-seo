import { BarChart3, Compass, FileDown, HelpCircle, LayoutDashboard, ListVideo, LogOut, Settings } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "#/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analyses", href: "/analyses", icon: ListVideo },
  { name: "Discover", href: "/profiles", icon: Compass },
  { name: "Exports", href: "/exports", icon: FileDown },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

function SidebarFooterFallback() {
  return (
    <div className="border-t p-3">
      <div className="h-7" />
    </div>
  );
}

function SidebarFooter() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<{ user: { name: string; email: string; image: string | null } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Dynamic import to avoid SSR issues
    import("#/lib/auth.client").then(({ authClient }) => {
      authClient.getSession().then((result) => {
        if (result.data) {
          setSession({
            user: {
              name: result.data.user.name,
              email: result.data.user.email,
              image: result.data.user.image ?? null,
            },
          });
        }
        setLoading(false);
      });
    });
  }, []);

  // Server render and initial hydration - must match exactly
  if (!mounted || loading) {
    return <SidebarFooterFallback />;
  }

  if (!session) {
    return (
      <div className="border-t p-3">
        <Link to="/login">
          <Button variant="outline" size="sm" className="w-full">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border-t p-3 space-y-2">
      <div className="flex items-center gap-2 px-1">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500">
            <span className="text-xs font-semibold text-white">
              {session.user.name?.charAt(0) || "U"}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{session.user.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        onClick={async () => {
          const { signOut } = await import("#/lib/auth.client");
          await signOut();
          window.location.href = "/";
        }}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}

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
      <SidebarFooter />
    </div>
  );
}
