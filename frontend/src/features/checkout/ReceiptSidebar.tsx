import { Button } from "@/components/ui/button";
import type { CategoryWithItems, ItemSelectionState, CheckoutOrderLineInput } from "@/features/checkout/types";

type ReceiptSidebarProps = {
  categories: CategoryWithItems[];
  selectionByItemId: Record<number, ItemSelectionState>;
  onValidate: (lines: CheckoutOrderLineInput[]) => Promise<void>;
  isSubmitting: boolean;
};

function parsePrice(value: string): number {
  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ReceiptSidebar({ categories, selectionByItemId, onValidate, isSubmitting }: ReceiptSidebarProps) {
  const selectedItems: CheckoutOrderLineInput[] = categories
    .flatMap((category) => category.items)
    .map((item) => {
      const state = selectionByItemId[item.id] ?? { quantity: 0, totalPrice: "" };

      return {
        itemId: item.id,
        label: item.label,
        quantity: state.quantity,
        totalPrice: parsePrice(state.totalPrice),
      };
    })
    .filter((item) => item.quantity > 0);

  const totalArticles = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalToPay = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <aside className="xl:sticky xl:top-6">
      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight">Ticket de caisse</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalArticles} article{totalArticles > 1 ? "s" : ""}
          </p>
        </div>

        <div className="space-y-3">
          {selectedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Aucun article sélectionné.
            </div>
          ) : (
            selectedItems.map((item) => (
              <div key={item.itemId} className="rounded-2xl border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantité : {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    {item.totalPrice.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nombre d’articles</span>
            <span className="font-medium">{totalArticles}</span>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total à payer</span>
            <span>{totalToPay.toFixed(2)} €</span>
          </div>

          <Button
            type="button"
            className="mt-2 w-full"
            disabled={selectedItems.length === 0 || isSubmitting}
            onClick={() => onValidate(selectedItems)}
          >
            {isSubmitting ? "Validation..." : "Valider le ticket"}
          </Button>
        </div>
      </section>
    </aside>
  );
}
