import { Button } from "@/components/ui/button";
import { itemImages } from "@/features/checkout/item-images";
import type { Item, ItemSelectionState } from "@/features/checkout/types";

type ProductCardProps = {
  item: Item;
  state: ItemSelectionState;
  onIncrement: (itemId: number) => void;
  onDecrement: (itemId: number) => void;
  onPriceChange: (itemId: number, value: string) => void;
};

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity < 0) return null; // pas d'entrée stock → on n'affiche rien

  if (quantity === 0) {
    return (
      <span className="absolute left-2 top-2 z-10 rounded-md bg-destructive/90 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
        Rupture
      </span>
    );
  }

  if (quantity <= 5) {
    return (
      <span className="absolute left-2 top-2 z-10 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
        Stock : {quantity}
      </span>
    );
  }

  return (
    <span className="absolute left-2 top-2 z-10 rounded-md bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
      Stock : {quantity}
    </span>
  );
}

export function ProductCard({
  item,
  state,
  onIncrement,
  onDecrement,
  onPriceChange,
}: ProductCardProps) {
  const imageSrc = itemImages[item.imagePath];

  return (
    <article className="flex h-full min-h-[360px] w-full flex-col rounded-2xl border bg-card p-4 shadow-sm">
      {/* Image zone with stock badge */}
      <div className="relative mb-4 flex h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
        <StockBadge quantity={item.stockQuantity} />
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.label}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <span className="text-xs text-muted-foreground">Pas d'image</span>
        )}
      </div>

      <div className="mb-4 text-center">
        <h3 className="min-h-[3rem] text-sm font-semibold leading-6">{item.label}</h3>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-12 px-0"
            onClick={() => onDecrement(item.id)}
            disabled={state.quantity <= 0}
          >
            -1
          </Button>
          <div className="flex h-10 w-16 items-center justify-center rounded-md border bg-muted text-sm font-medium">
            {state.quantity}
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-12 px-0"
            onClick={() => onIncrement(item.id)}
          >
            +1
          </Button>
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={state.totalPrice}
          onChange={(e) => onPriceChange(item.id, e.target.value)}
          placeholder="Prix total"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </article>
  );
}
