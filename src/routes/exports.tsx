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
          Fonctionnalité à venir - Gérez vos exports et rapports
        </p>
      </div>
    </div>
  );
}
