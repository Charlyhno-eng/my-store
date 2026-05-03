import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function BasicPage({ title, description }: { title: string; description: string }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10">
        <section className="w-full rounded-3xl border bg-card p-8 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            {description}
          </p>

          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/">Retour à l’accueil</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default BasicPage;
