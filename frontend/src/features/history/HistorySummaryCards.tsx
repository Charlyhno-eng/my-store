import type { OrderHistoryItem } from "./types";

type HistorySummaryCardsProps = {
  orders: OrderHistoryItem[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function HistorySummaryCards({ orders }: HistorySummaryCardsProps) {
  const totalOrders = orders.length;
  const totalItemsSold = orders.reduce((sum, order) => sum + order.quantity, 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.lineTotal, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Lignes de vente</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{totalOrders}</p>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Articles vendus</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{totalItemsSold}</p>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Montant total</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {formatPrice(totalRevenue)}
        </p>
      </div>
    </div>
  );
}
