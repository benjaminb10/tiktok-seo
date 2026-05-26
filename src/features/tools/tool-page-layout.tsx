import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { LandingFooter } from "#/components/landing-footer";
import { TOOLS, type Tool } from "./tools-data";

type ToolPageLayoutProps = {
  toolId: string;
  children: React.ReactNode;
};

export function ToolPageLayout({ toolId, children }: ToolPageLayoutProps) {
  const currentTool = TOOLS.find((t) => t.id === toolId);
  const otherTools = TOOLS.filter((t) => t.id !== toolId);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            to="/tools"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Free Tools
          </Link>
        </nav>

        {/* Page Header */}
        {currentTool && (
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <currentTool.icon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">{currentTool.title}</h1>
            <p className="text-muted-foreground">{currentTool.description}</p>
          </div>
        )}

        {/* Tool Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mb-8 rounded-xl border bg-primary/5 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold">Want deeper insights?</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Analyze any TikTok profile with detailed metrics, AI-powered insights, and more.
          </p>
          <Link to="/app">
            <Button>
              Try Full Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Other Tools */}
        <section>
          <h2 className="mb-4 text-lg font-semibold">More Free Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {otherTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate({ to: tool.href as "/tools/tiktok-engagement-calculator" })}
      className="block w-full text-left"
    >
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader className="pb-2">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <tool.icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-base">{tool.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </CardContent>
      </Card>
    </button>
  );
}
