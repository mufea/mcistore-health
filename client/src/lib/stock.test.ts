import { describe, expect, it } from "vitest";
import { isLowStock, isOutOfStock, LOW_STOCK_THRESHOLD, matchesStockFilter } from "./stock";

describe("isOutOfStock", () => {
  it("flags zero or negative availability only", () => {
    expect(isOutOfStock(0)).toBe(true);
    expect(isOutOfStock(-1)).toBe(true);
    expect(isOutOfStock(1)).toBe(false);
  });
});

describe("isLowStock", () => {
  it("flags only positive availability at or below the default threshold", () => {
    expect(isLowStock(LOW_STOCK_THRESHOLD)).toBe(true);
    expect(isLowStock(1)).toBe(true);
    expect(isLowStock(LOW_STOCK_THRESHOLD + 1)).toBe(false);
    expect(isLowStock(0)).toBe(false);
  });

  it("supports a supplied threshold", () => {
    expect(isLowStock(3, 3)).toBe(true);
    expect(isLowStock(4, 3)).toBe(false);
  });

  it("filters only low-stock products when requested", () => {
    expect(matchesStockFilter(3, true)).toBe(true);
    expect(matchesStockFilter(6, true)).toBe(false);
    expect(matchesStockFilter(0, true)).toBe(false);
    expect(matchesStockFilter(6, false)).toBe(true);
  });
});
