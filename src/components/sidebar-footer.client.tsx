import { LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { signOut, useSession } from "#/lib/auth.client";
import { Button } from "#/components/ui/button";

export function SidebarFooter() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ne rien afficher côté serveur pour éviter les erreurs SSR
  if (!mounted) {
    return (
      <div className="border-t p-3">
        <div className="h-7" /> {/* Placeholder pour éviter le layout shift */}
      </div>
    );
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
