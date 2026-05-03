import type { Category } from "./types";

type CategoriesPanelProps = {
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

export function CategoriesPanel({ categories, onAdd, onEdit, onDelete }: CategoriesPanelProps) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Catégories</h2>
          <p className="text-xs text-muted-foreground">{categories.length} catégorie{categories.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={onAdd}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          + Ajouter
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-muted-foreground">
          Aucune catégorie. Commencez par en créer une.
        </div>
      ) : (
        <ul className="divide-y">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
            >
              <span className="text-sm font-medium">{cat.label}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(cat)}
                  className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(cat)}
                  className="rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
