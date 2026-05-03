import { useEffect, useState } from "react";
import { GetOrdersHistory } from "../../wailsjs/go/main/App";
import BackToHomeButton from "@/components/navigation/BackToHomeButton";
import { HistorySummaryCards } from "@/features/history/HistorySummaryCards";
import { OrdersTable } from "@/features/history/OrdersTable";
import type { OrderHistoryItem } from "@/features/history/types";

function SalesHistoryPage() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GetOrdersHistory()
      .then((data) => { setOrders(data ?? []) })
      .catch((err) => { setError(String(err)) })
      .finally(() => { setLoading(false) });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Historique
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Historique des ventes
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Retrouvez toutes les lignes enregistrées depuis la caisse.
            </p>
          </div>

          <BackToHomeButton />
        </div>

        {loading && (
          <div className="rounded-2xl border bg-card p-6 text-muted-foreground shadow-sm">
            Chargement de l’historique...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-card p-6 text-destructive shadow-sm">
            Erreur : {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            <HistorySummaryCards orders={orders} />
            <OrdersTable orders={orders} />
          </div>
        )}
      </div>
    </main>
  );
}

export default SalesHistoryPage;
