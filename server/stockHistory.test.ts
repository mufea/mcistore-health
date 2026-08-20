import { describe, expect, it } from "vitest";
import { calculateFulfilledStockChange, finalizePaidOrderInventory, type StockFinalizationStore } from "./stockHistory";

describe("calculateFulfilledStockChange", () => {
  it("keeps sequential paid-order finalizations and their audit deltas consistent", () => {
    const firstOrder = calculateFulfilledStockChange(12, 3);
    const secondOrder = calculateFulfilledStockChange(firstOrder.newStock, 4);

    expect(firstOrder).toEqual({ previousStock: 12, newStock: 9, change: -3 });
    expect(secondOrder).toEqual({ previousStock: 9, newStock: 5, change: -4 });
  });

  it("does not permit fulfilled stock to fall below zero", () => {
    expect(calculateFulfilledStockChange(2, 5)).toEqual({ previousStock: 2, newStock: 0, change: -2 });
  });

  it("finalizes paid orders sequentially with accurate stock history rows", async () => {
    const stock = new Map([[7, 12]]);
    const history: Array<{ previousStock: number; newStock: number; change: number; orderId: number }> = [];
    const store: StockFinalizationStore = {
      getLockedStock: async (productId) => stock.get(productId),
      decrementStock: async (productId, quantity) => stock.set(productId, Math.max((stock.get(productId) ?? 0) - quantity, 0)),
      createHistory: async (entry) => { history.push(entry); },
    };

    await finalizePaidOrderInventory([{ productId: 7, quantity: 3 }], 101, store);
    await finalizePaidOrderInventory([{ productId: 7, quantity: 4 }], 102, store);

    expect(stock.get(7)).toBe(5);
    expect(history).toEqual([
      expect.objectContaining({ previousStock: 12, newStock: 9, change: -3, orderId: 101 }),
      expect.objectContaining({ previousStock: 9, newStock: 5, change: -4, orderId: 102 }),
    ]);
  });
});
