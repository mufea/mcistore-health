import { describe, expect, it } from "vitest";
import { getInStockAlternatives } from "./productAlternatives";

describe("getInStockAlternatives", () => {
  const current = { id: 1, category: "Vitamins", stock: 0, isFeatured: false };
  const products = [
    current,
    { id: 2, category: "Vitamins", stock: 4, isFeatured: false },
    { id: 3, category: "Vitamins", stock: 2, isFeatured: true },
    { id: 4, category: "Wellness", stock: 8, isFeatured: true },
    { id: 5, category: "Vitamins", stock: 0, isFeatured: true },
  ];

  it("returns only available alternatives, prioritizing similar featured products", () => {
    expect(getInStockAlternatives(current, products).map((item) => item.id)).toEqual([3, 2, 4]);
  });

  it("honors the requested result limit", () => {
    expect(getInStockAlternatives(current, products, 2).map((item) => item.id)).toEqual([3, 2]);
  });
});
