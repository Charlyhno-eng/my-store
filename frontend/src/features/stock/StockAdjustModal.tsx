import { useRef, useState } from "react";
import type { ItemWithStock } from "./types";
import type { Mode } from "./types";

type StockAdjustModalProps = {
  item: ItemWithStock;
  onClose: () => void;
  onSet: (itemId: number, quantity: number) => Promise<void>;
  onAdjust: (itemId: number, delta: number) => Promise<void>;
};

export function StockAdjustModal({ item, onClose, onSet, onAdjust }: StockAdjustModalProps) {
  const [mode, setMode] = useState<Mode>("add");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const modeLabels: Record<Mode, string> = {
    set: "Fixer à",
    add: "Ajouter",
    remove: "Retirer",
  };

  async function handleSubmit() {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) {
      setError("Veuillez saisir un nombre positif.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "set") {
        await onSet(item.id, num);
      } else if (mode === "add") {
        await onAdjust(item.id, num);
      } else {
        await onAdjust(item.id, -num);
      }
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
        <h2 className="text-lg font-semibold tracking-tight">Ajuster le stock</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{item.label}</span> — stock
          actuel :{" "}
          <span className="font-semibold">
            {item.quantity >= 0 ? item.quantity : "—"}
          </span>{" "}
          unité{item.quantity > 1 ? "s" : ""}
        </p>

        {/* Mode selector */}
        <div className="mt-4 flex rounded-lg border p-1 gap-1">
          {(["add", "remove", "set"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setValue("");
                setError(null);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium">
            {mode === "set"
              ? "Nouvelle quantité"
              : mode === "add"
              ? "Quantité à ajouter"
              : "Quantité à retirer"}
          </label>
          <input
            ref={inputRef}
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="0"
          />
          {mode !== "set" && item.quantity >= 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Résultat :{" "}
              <span className="font-medium text-foreground">
                {mode === "add"
                  ? item.quantity + (parseInt(value, 10) || 0)
                  : Math.max(0, item.quantity - (parseInt(value, 10) || 0))}
              </span>{" "}
              unité(s)
            </p>
          )}
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
            {loading ? "Enregistrement…" : "Valider"}
          </button>
        </div>
      </div>
    </div>
  );
}
