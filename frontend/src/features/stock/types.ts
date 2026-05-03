export type Category = {
  id: number;
  label: string;
};

export type ItemWithStock = {
  id: number;
  label: string;
  categoryId: number;
  imagePath: string;
  quantity: number; // -1 = no stock entry
};

export type Mode = "set" | "add" | "remove";

export type StockFilter = "all" | "low" | "out";

export type ModalState =
  | { type: "none" }
  | { type: "categoryCreate" }
  | { type: "categoryEdit"; category: Category }
  | { type: "categoryDelete"; category: Category }
  | { type: "itemCreate" }
  | { type: "itemEdit"; item: ItemWithStock }
  | { type: "itemDelete"; item: ItemWithStock }
  | { type: "stockAdjust"; item: ItemWithStock };
