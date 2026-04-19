import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10">
        <section className="w-full rounded-3xl border bg-card p-8 shadow-sm sm:p-10">
          <div className="mb-10 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Gestion de supérette
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              My Store
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Choisissez un espace pour commencer.
            </p>
          </div>

          <div className="mx-auto mb-4 max-w-xl">
            <Button asChild size="lg" className="h-14 w-full text-base font-semibold shadow-sm">
              <Link to="/checkout">Accéder à la caisse</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button asChild variant="secondary" className="h-12 w-full justify-center">
              <Link to="/sales-history">Historique des ventes</Link>
            </Button>

            <Button asChild variant="secondary" className="h-12 w-full justify-center">
              <Link to="/products">Accéder aux produits</Link>
            </Button>

            <Button asChild variant="secondary" className="h-12 w-full justify-center">
              <Link to="/storage">Accéder au stockage</Link>
            </Button>

            <Button asChild variant="secondary" className="h-12 w-full justify-center">
              <Link to="/daily-report">Rapport journalier</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomePage;
