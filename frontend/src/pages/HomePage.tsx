import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <section className="w-full rounded-3xl border bg-card p-8 shadow-sm sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-stretch">
            <div className="flex flex-col justify-between rounded-3xl border bg-background p-8 shadow-sm">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Gestion de supérette
                </p>

                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  My Store
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  Gérez votre caisse simplement, enregistrez les ventes rapidement
                  et gardez un accès direct à vos produits et à votre stockage.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border bg-card p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  Accès principal
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Ouvrir la caisse
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Lancez immédiatement l’écran de vente pour enregistrer un ticket,
                  saisir les quantités et finaliser un passage en caisse.
                </p>

                <Button
                  asChild
                  size="lg"
                  className="mt-5 h-14 w-full text-base font-semibold shadow-sm sm:w-auto sm:px-8"
                >
                  <Link to="/checkout">Accéder à la caisse</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/sales-history"
                className="group rounded-2xl border bg-background p-5 shadow-sm transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Suivi
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Historique des ventes
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Consultez les ventes passées et retrouvez les tickets déjà enregistrés.
                </p>
              </Link>

              <Link
                to="/products"
                className="group rounded-2xl border bg-background p-5 shadow-sm transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Catalogue
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Produits
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Gérez les articles, leurs catégories et leurs visuels.
                </p>
              </Link>

              <Link
                to="/storage"
                className="group rounded-2xl border bg-background p-5 shadow-sm transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  Stock
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Stockage
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Suivez l’organisation des réserves et l’état du stock disponible.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomePage;
