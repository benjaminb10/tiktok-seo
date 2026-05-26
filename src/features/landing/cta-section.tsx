import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

export function CTASection() {
  return (
    <section className="border-t py-20 lg:py-28">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">
          Ready to analyze?
        </h2>
        <p className="mb-8 text-muted-foreground">
          Start with a free analysis. No account needed.
        </p>

        <Link to="/app">
          <Button size="lg" className="h-12 px-8">
            Try it free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
