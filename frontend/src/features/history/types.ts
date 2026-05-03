export type OrderHistoryItem = {
  id: number;
  itemId: number;
  itemLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  orderedAt: string;
};
