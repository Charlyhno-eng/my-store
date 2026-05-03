import { useEffect, useRef, useState } from "react";
import type { Category, ItemWithStock } from "./types";

type ItemModalProps = {
  item: ItemWithStock | null; // null = creation
  categories: Category[];
  onClose: () => void;
  onSave: (label: string, categoryId: number, imagePath: string) => Promise<void>;
};

export function ItemModal({ item, categories, onClose, onSave }: ItemModalProps) {
  const [label, setLabel] = useState(item?.label ?? "");
  const [categoryId, setCategoryId] = useState<number>(item?.categoryId ?? categories[0]?.id ?? 0);
  const [imagePath, setImagePath] = useState(item?.imagePath ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit() {
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Le libellé ne peut pas être vide.");
      return;
    }

    if (!categoryId) {
      setError("Veuillez sélectionner une catégorie.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(trimmed, categoryId, imagePath.trim());
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold tracking-tight">
          {item ? "Modifier le produit" : "Nouveau produit"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {item
            ? "Modifiez les informations du produit."
            : "Renseignez les informations du nouveau produit."}
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Libellé</label>
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Ex : Coca-Cola 33cl"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Chemin image{" "}
              <span className="font-normal text-muted-foreground">(optionnel)</span>
            </label>
            <input
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="Ex : /images/coca.png"
            />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60 hover:opacity-90"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
