import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/checkout/ProductCard";
import { ReceiptSidebar } from "@/features/checkout/ReceiptSidebar";
import type { CategoryWithItems, ItemSelectionState, CheckoutOrderLineInput } from "@/features/checkout/types";
import { InsertOrder, GetCheckoutCategories, SaveReceipt } from "../../wailsjs/go/main/App";
import BackToHomeButton from "@/components/navigation/BackToHomeButton";

function CheckoutPage() {
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionByItemId, setSelectionByItemId] = useState<Record<number, ItemSelectionState>>({});

  useEffect(() => {
    const isWailsAvailable = typeof window !== "undefined" && !!window.go?.main?.App;

    if (!isWailsAvailable) {
      setError("Wails runtime indisponible. Lance l'application avec wails dev.");
      setLoading(false);
      return;
    }

    GetCheckoutCategories()
      .then((data) => { setCategories(data ?? []) })
      .catch((err) => { setError(String(err)) })
      .finally(() => { setLoading(false) });
  }, []);

  const nonEmptyCategories = useMemo(() => {
    return categories.filter((category) => category.items.length > 0);
  }, [categories]);

  const getItemState = (itemId: number): ItemSelectionState => {
    return selectionByItemId[itemId] ?? { quantity: 0, totalPrice: "" };
  };

  const updateItemState = (itemId: number, nextState: Partial<ItemSelectionState>) => {
    setSelectionByItemId((prev) => {
      const current = prev[itemId] ?? { quantity: 0, totalPrice: "" };

      return {
        ...prev,
        [itemId]: { ...current, ...nextState },
      };
    });
  };

  const incrementQuantity = (itemId: number) => {
    const current = getItemState(itemId);
    updateItemState(itemId, { quantity: current.quantity + 1 });
  };

  const decrementQuantity = (itemId: number) => {
    const current = getItemState(itemId);
    if (current.quantity <= 0) {
      return;
    }

    updateItemState(itemId, { quantity: current.quantity - 1 });
  };

  const updatePrice = (itemId: number, totalPrice: string) => {
    updateItemState(itemId, { totalPrice });
  };

  const buildReceiptContent = (lines: CheckoutOrderLineInput[]) => {
    const now = new Date();
    const totalArticles = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalToPay = lines.reduce((sum, line) => sum + line.totalPrice, 0);

    const formattedDate = now.toLocaleString("fr-FR");

    return [
      "MY STORE",
      "Ticket de caisse",
      formattedDate,
      "--------------------------------",
      ...lines.flatMap((line) => [
        line.label,
        `  Quantité : ${line.quantity}`,
        `  Total : ${line.totalPrice.toFixed(2)} €`,
      ]),
      "--------------------------------",
      `Articles : ${totalArticles}`,
      `Total : ${totalToPay.toFixed(2)} €`,
    ].join("\n");
  };

  const handleValidateCheckout = async (lines: CheckoutOrderLineInput[]) => {
    try {
      setIsSubmitting(true);
      setError(null);

      for (const line of lines) {
        if (line.quantity <= 0) {
          continue;
        }

        const unitPrice = line.quantity > 0 ? line.totalPrice / line.quantity : 0;
        await InsertOrder(line.itemId, line.quantity, unitPrice);
      }

      const receiptContent = buildReceiptContent(lines);
      await SaveReceipt(receiptContent);

      setSelectionByItemId({});
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="w-full px-6 py-8 xl:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Caisse</h1>
            <p className="mt-2 text-muted-foreground">
              Sélectionnez les produits puis vérifiez le ticket à droite.
            </p>
          </div>

          <BackToHomeButton />
        </div>

        {loading && (
          <div className="rounded-2xl border bg-card p-6 text-muted-foreground shadow-sm">
            Chargement des produits...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-card p-6 text-destructive shadow-sm">
            Erreur : {error}
          </div>
        )}

        {!loading && !error && nonEmptyCategories.length === 0 && (
          <div className="rounded-2xl border bg-card p-6 text-muted-foreground shadow-sm">
            Aucune catégorie avec produits disponible.
          </div>
        )}

        {!loading && nonEmptyCategories.length > 0 && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0 space-y-8">
              {nonEmptyCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-3xl border bg-card p-5 shadow-sm"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {category.label}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {category.items.length} produit
                      {category.items.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {category.items.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        state={getItemState(item.id)}
                        onIncrement={incrementQuantity}
                        onDecrement={decrementQuantity}
                        onPriceChange={updatePrice}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <ReceiptSidebar
              categories={nonEmptyCategories}
              selectionByItemId={selectionByItemId}
              onValidate={handleValidateCheckout}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default CheckoutPage;
