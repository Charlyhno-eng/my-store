import { useState } from "react";

type DeleteConfirmModalProps = {
  label: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteConfirmModal({ label, description, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    try {
      await onConfirm();
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
        <h2 className="text-lg font-semibold tracking-tight">Confirmer la suppression</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Voulez-vous supprimer{" "}
          <span className="font-semibold text-foreground">« {label} »</span> ?{" "}
          {description && <span>{description}</span>}
        </p>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60 hover:opacity-90"
          >
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
