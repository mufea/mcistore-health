export function calculateFulfilledStockChange(previousStock: number, quantity: number) {
  const newStock = Math.max(previousStock - quantity, 0);
  return {
    previousStock,
    newStock,
    change: newStock - previousStock,
  };
}

export type PaidOrderStockItem = { productId: number; quantity: number };

export type StockFinalizationStore = {
  getLockedStock: (productId: number) => Promise<number | undefined>;
  decrementStock: (productId: number, quantity: number) => Promise<void>;
  createHistory: (entry: {
    productId: number;
    previousStock: number;
    newStock: number;
    change: number;
    reason: "order_fulfilled";
    changedByName: string;
    orderId: number;
  }) => Promise<void>;
};

export async function finalizePaidOrderInventory(items: PaidOrderStockItem[], orderId: number, store: StockFinalizationStore) {
  for (const item of items) {
    const previousStock = await store.getLockedStock(item.productId);
    if (previousStock === undefined) continue;

    const stockChange = calculateFulfilledStockChange(previousStock, item.quantity);
    await store.decrementStock(item.productId, item.quantity);
    if (stockChange.change !== 0) {
      await store.createHistory({
        productId: item.productId,
        ...stockChange,
        reason: "order_fulfilled",
        changedByName: "System",
        orderId,
      });
    }
  }
}
