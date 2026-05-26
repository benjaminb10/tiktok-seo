import { BarChart3, Compass, LayoutDashboard, ListVideo, LogOut, MessageCircle, PlusCircle, X } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "#/components/ui/button";
import { QuotaSummaryCard } from "#/features/paywall/quota-summary-card";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analyses", href: "/analyses", icon: ListVideo },
  { name: "Discover", href: "/discover", icon: Compass },
];

const CONTACT_URL = "https://wa.me/33651774359?text=Hey%20I%20have%20a%20question%20or%20need%20help%20on%20Viewlify.app";

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
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-semibold text-muted-foreground">
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

type SidebarProps = {
  onClose?: () => void;
};

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-56 flex-col border-r bg-background lg:w-48 lg:bg-muted/30">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Viewlify</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {/* New Analysis Button */}
        <Link to="/app" className="block mb-2">
          <Button className="w-full justify-start gap-2">
            <PlusCircle className="h-4 w-4" />
            New analysis
          </Button>
        </Link>

        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
        <a
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Contact us
        </a>
      </nav>

      {/* Quota Summary */}
      <div className="px-2 pb-2">
        <QuotaSummaryCard />
      </div>

      {/* Footer */}
      <SidebarFooter />
    </div>
  );
}
