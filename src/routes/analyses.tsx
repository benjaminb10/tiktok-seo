import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analyses")({
  component: AnalysesPage,
});

function AnalysesPage() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Analyses</h1>
        <p className="text-muted-foreground">
          Fonctionnalité à venir - Comparez plusieurs comptes et consultez l'historique
        </p>
      </div>
    </div>
  );
}
