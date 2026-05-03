import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl flex flex-col gap-4">

        {/* Header */}
        <div className="mb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Gestion de supérette
          </p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight">My Store</h1>
        </div>

        {/* Primary CTA — caisse */}
        <Link
          to="/checkout"
          className="group relative overflow-hidden rounded-2xl bg-primary p-8 shadow-lg transition-opacity hover:opacity-95 active:opacity-90"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
            Accès principal
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-foreground">
            Ouvrir la caisse
          </h2>
          <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
            Enregistrez un ticket, saisissez les quantités et finalisez un passage en caisse.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-foreground/15 px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary-foreground/20">
            Accéder →
          </span>
        </Link>

        {/* Secondary actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/sales-history"
            className="rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Suivi
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              Historique des ventes
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Consultez les tickets et ventes enregistrés.
            </p>
          </Link>

          <Link
            to="/storage"
            className="rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Inventaire
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              Stock & Produits
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Gérez les articles, catégories et niveaux de stock.
            </p>
          </Link>
        </div>

      </div>
    </main>
  );
}

export default HomePage;
