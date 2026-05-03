import type { Category, ItemWithStock, StockFilter } from "./types";

type StockTableProps = {
  items: ItemWithStock[];
  categories: Category[];
  filter: StockFilter;
  search: string;
  onAdjust: (item: ItemWithStock) => void;
  onEdit: (item: ItemWithStock) => void;
  onDelete: (item: ItemWithStock) => void;
};

function getStockBadge(quantity: number) {
  if (quantity < 0) {
    return (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
        —
      </span>
    );
  }
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
        Rupture
      </span>
    );
  }
  if (quantity <= 5) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
        Faible
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
      OK
    </span>
  );
}

export function StockTable({ items, categories, filter, search, onAdjust, onEdit, onDelete }: StockTableProps) {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.label]));

  const filtered = items.filter((item) => {
    const matchSearch =
      search === "" ||
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      (categoryMap[item.categoryId] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchFilter = filter === "all" || (filter === "out" && item.quantity === 0) || (filter === "low" && item.quantity > 0 && item.quantity <= 5);

    return matchSearch && matchFilter;
  });

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight">Aucun produit trouvé</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Modifiez vos filtres ou ajoutez un nouveau produit.
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
              <th className="px-4 py-3 text-left font-medium">Produit</th>
              <th className="px-4 py-3 text-left font-medium">Catégorie</th>
              <th className="px-4 py-3 text-left font-medium">Quantité</th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{item.label}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {categoryMap[item.categoryId] ?? "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {item.quantity >= 0 ? item.quantity : "—"}
                </td>
                <td className="px-4 py-3">{getStockBadge(item.quantity)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onAdjust(item)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                      title="Ajuster le stock"
                    >
                      Stock
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                      title="Modifier le produit"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      title="Supprimer le produit"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
