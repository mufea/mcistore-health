import { describe, expect, it } from "vitest";
import { finalizeStockReservation } from "./db";
import type { StockFinalizationStore } from "./stockHistory";

describe("finalizeStockReservation", () => {
  it("decrements stock and writes ordered audit rows across sequential paid orders", async () => {
    const stock = new Map([[7, 12]]);
    const claimedOrders = new Set<number>();
    const history: Array<{ productId: number; previousStock: number; newStock: number; change: number; orderId: number }> = [];
    const orderItems = new Map([[701, [{ productId: 7, quantity: 3 }]], [702, [{ productId: 7, quantity: 4 }]]]);

    const store: StockFinalizationStore = {
      getLockedStock: async (productId) => stock.get(productId),
      decrementStock: async (productId, quantity) => stock.set(productId, Math.max((stock.get(productId) ?? 0) - quantity, 0)),
      createHistory: async (entry) => { history.push(entry); },
    };
    const dependencies = {
      getOrderItems: async (orderId: number) => orderItems.get(orderId) ?? [],
      runInTransaction: async (orderId: number, work: (transactionStore: StockFinalizationStore) => Promise<void>) => {
        if (claimedOrders.has(orderId)) return false;
        claimedOrders.add(orderId);
        await work(store);
        return true;
      },
    };

    await expect(finalizeStockReservation(701, dependencies)).resolves.toBe(true);
    await expect(finalizeStockReservation(702, dependencies)).resolves.toBe(true);
    await expect(finalizeStockReservation(701, dependencies)).resolves.toBe(false);

    expect(stock.get(7)).toBe(5);
    expect(history).toEqual([
      expect.objectContaining({ productId: 7, previousStock: 12, newStock: 9, change: -3, orderId: 701 }),
      expect.objectContaining({ productId: 7, previousStock: 9, newStock: 5, change: -4, orderId: 702 }),
    ]);
  });
});
