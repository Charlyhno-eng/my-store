export type Item = {
  id: number;
  label: string;
  imagePath: string;
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
