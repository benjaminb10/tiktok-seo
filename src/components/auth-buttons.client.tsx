import { LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "#/components/ui/button";
import { signOut, useSession } from "#/lib/auth.client";

export function AuthButtons() {
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Afficher les boutons par défaut côté serveur et pendant le chargement
  if (!mounted || isPending) {
    return (
      <>
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link to="/login">
          <Button size="sm">Get started</Button>
        </Link>
      </>
    );
  }

  if (session) {
    return (
      <>
        <Link to="/app">
          <Button variant="ghost" size="sm" className="gap-2">
            {session.user.image && (
              <img
                src={session.user.image}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            )}
            {session.user.name || session.user.email}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </>
    );
  }

  return (
    <>
      <Link to="/login">
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
      </Link>
      <Link to="/login">
        <Button size="sm">Get started</Button>
      </Link>
    </>
  );
}
