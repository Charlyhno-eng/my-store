import type { ItemWithStock } from "./types";

export function StockSummaryCards({ items }: { items: ItemWithStock[] }) {
  const totalItems = items.length;
  const outOfStock = items.filter((i) => i.quantity === 0).length;
  const lowStock = items.filter((i) => i.quantity > 0 && i.quantity <= 5).length;
  const totalUnits = items.reduce((sum, i) => sum + (i.quantity >= 0 ? i.quantity : 0), 0);

  const cards = [
    { label: "Références",         value: totalItems, accent: false },
    { label: "Unités en stock",    value: totalUnits, accent: false },
    { label: "Stock faible (≤ 5)", value: lowStock,   accent: lowStock > 0,   accentClass: "text-amber-500" },
    { label: "Rupture de stock",   value: outOfStock, accent: outOfStock > 0, accentClass: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p
            className={`mt-2 text-2xl font-semibold tracking-tight ${
              card.accent ? card.accentClass : ""
            }`}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
