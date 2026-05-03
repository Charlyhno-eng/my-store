import type { OrderHistoryItem } from "./types";
import { formatDate, formatPrice } from "../../helpers/helpers";

export function OrdersTable({ orders }: { orders: OrderHistoryItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">Aucune vente enregistrée</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Les ordres ajoutés depuis la caisse apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Produit</th>
              <th className="px-4 py-3 text-left font-medium">Quantité</th>
              <th className="px-4 py-3 text-left font-medium">Prix unitaire</th>
              <th className="px-4 py-3 text-left font-medium">Total ligne</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3">{order.itemLabel}</td>
                <td className="px-4 py-3">{order.quantity}</td>
                <td className="px-4 py-3">{formatPrice(order.unitPrice)}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.lineTotal)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(order.orderedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
