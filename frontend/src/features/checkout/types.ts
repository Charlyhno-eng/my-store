export type Item = {
  id: number;
  label: string;
  imagePath: string;
  stockQuantity: number; // -1 = no stock entry
};

export type CategoryWithItems = {
  id: number;
  label: string;
  items: Item[];
};

export type ItemSelectionState = {
  quantity: number;
  totalPrice: string;
};

export type CheckoutOrderLineInput = {
  itemId: number;
  label: string;
  quantity: number;
  totalPrice: number;
};
