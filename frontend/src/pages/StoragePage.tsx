import { useEffect, useState } from "react";
import {
  GetCategories,
  GetItems,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  CreateItem,
  UpdateItem,
  DeleteItem,
  SetStock,
  AdjustStock,
} from "../../wailsjs/go/main/App";
import BackToHomeButton from "@/components/navigation/BackToHomeButton";
import { StockSummaryCards } from "@/features/stock/StockSummaryCards";
import { StockTable } from "@/features/stock/StockTable";
import { CategoriesPanel } from "@/features/stock/CategoriesPanel";
import { CategoryModal } from "@/features/stock/CategoryModal";
import { ItemModal } from "@/features/stock/ItemModal";
import { StockAdjustModal } from "@/features/stock/StockAdjustModal";
import { DeleteConfirmModal } from "@/features/stock/DeleteConfirmModal";
import type { Category, ItemWithStock, StockFilter } from "@/features/stock/types";
import type { ModalState } from "@/features/stock/types";

function StoragePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ItemWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [tab, setTab] = useState<"items" | "categories">("items");
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  // Load data
  async function loadAll() {
    try {
      const [cats, its] = await Promise.all([GetCategories(), GetItems()]);
      setCategories(cats ?? []);
      setItems(its ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function closeModal() {
    setModal({ type: "none" });
  }

  async function handleCategorySave(label: string) {
    if (modal.type === "categoryEdit") {
      await UpdateCategory(modal.category.id, label);
    } else {
      await CreateCategory(label);
    }
    await loadAll();
  }

  async function handleCategoryDelete() {
    if (modal.type !== "categoryDelete") return;
    await DeleteCategory(modal.category.id);
    await loadAll();
  }

  // Items
  async function handleItemSave(label: string, categoryId: number, imagePath: string) {
    if (modal.type === "itemEdit") {
      await UpdateItem(modal.item.id, label, categoryId, imagePath);
    } else {
      await CreateItem(label, categoryId, imagePath);
    }
    await loadAll();
  }

  async function handleItemDelete() {
    if (modal.type !== "itemDelete") return;
    await DeleteItem(modal.item.id);
    await loadAll();
  }

  // Stock
  async function handleSetStock(itemId: number, quantity: number) {
    await SetStock(itemId, quantity);
    await loadAll();
  }

  async function handleAdjustStock(itemId: number, delta: number) {
    await AdjustStock(itemId, delta);
    await loadAll();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Inventaire
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Gestion du stock
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Gérez vos produits, catégories et niveaux de stock.
            </p>
          </div>
          <BackToHomeButton />
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="rounded-2xl border bg-card p-6 text-muted-foreground shadow-sm">
            Chargement du stock…
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-card p-6 text-destructive shadow-sm">
            Erreur : {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Summary cards */}
            <StockSummaryCards items={items} />

            {/* Tab bar */}
            <div className="flex items-center gap-1 rounded-xl border bg-card p-1 shadow-sm w-fit">
              {(["items", "categories"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "items" ? "Produits" : "Catégories"}
                </button>
              ))}
            </div>

            {/* ── Products tab ── */}
            {tab === "items" && (
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Rechercher un produit…"
                      className="w-64 rounded-lg border bg-card px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                    <div className="flex rounded-lg border bg-card p-1 gap-1">
                      {([
                        ["all", "Tous"],
                        ["low", "Stock faible"],
                        ["out", "Rupture"],
                      ] as [StockFilter, string][]).map(([val, lbl]) => (
                        <button
                          key={val}
                          onClick={() => setFilter(val)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            filter === val
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setModal({ type: "itemCreate" })}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    + Nouveau produit
                  </button>
                </div>

                <StockTable
                  items={items}
                  categories={categories}
                  filter={filter}
                  search={search}
                  onAdjust={(item) => setModal({ type: "stockAdjust", item })}
                  onEdit={(item) => setModal({ type: "itemEdit", item })}
                  onDelete={(item) => setModal({ type: "itemDelete", item })}
                />
              </div>
            )}

            {/* ── Categories tab ── */}
            {tab === "categories" && (
              <CategoriesPanel
                categories={categories}
                onAdd={() => setModal({ type: "categoryCreate" })}
                onEdit={(cat) => setModal({ type: "categoryEdit", category: cat })}
                onDelete={(cat) => setModal({ type: "categoryDelete", category: cat })}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {(modal.type === "categoryCreate" || modal.type === "categoryEdit") && (
        <CategoryModal
          category={modal.type === "categoryEdit" ? modal.category : null}
          onClose={closeModal}
          onSave={handleCategorySave}
        />
      )}

      {modal.type === "categoryDelete" && (
        <DeleteConfirmModal
          label={modal.category.label}
          description="Cette action est irréversible. Elle échouera si des produits y sont rattachés."
          onClose={closeModal}
          onConfirm={handleCategoryDelete}
        />
      )}

      {(modal.type === "itemCreate" || modal.type === "itemEdit") && (
        <ItemModal
          item={modal.type === "itemEdit" ? modal.item : null}
          categories={categories}
          onClose={closeModal}
          onSave={handleItemSave}
        />
      )}

      {modal.type === "itemDelete" && (
        <DeleteConfirmModal
          label={modal.item.label}
          description="Cette action est irréversible. Elle échouera si des commandes référencent ce produit."
          onClose={closeModal}
          onConfirm={handleItemDelete}
        />
      )}

      {modal.type === "stockAdjust" && (
        <StockAdjustModal
          item={modal.item}
          onClose={closeModal}
          onSet={handleSetStock}
          onAdjust={handleAdjustStock}
        />
      )}
    </main>
  );
}

export default StoragePage;
