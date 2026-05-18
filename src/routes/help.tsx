import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/help")({
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Help</h1>
        <p className="text-muted-foreground">
          Coming soon - Documentation and support
        </p>
      </div>
    </div>
  );
}
