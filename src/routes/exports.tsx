import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/exports")({
  component: ExportsPage,
});

function ExportsPage() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Exports</h1>
        <p className="text-muted-foreground">
          Coming soon - Manage your exports and reports
        </p>
      </div>
    </div>
  );
}
