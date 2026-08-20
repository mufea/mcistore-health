import { describe, expect, it } from "vitest";
import { addComparedProductToCart, canSelectForComparison, MAX_COMPARISON_PRODUCTS, toggleComparedProduct } from "./productComparison";

describe("product comparison selection", () => {
  it("adds and removes compared products up to the maximum", () => {
    expect(toggleComparedProduct([], 1)).toEqual([1]);
    expect(toggleComparedProduct([1, 2], 2)).toEqual([1]);
    expect(toggleComparedProduct([1, 2, 3], 4)).toEqual([1, 2, 3]);
    expect(MAX_COMPARISON_PRODUCTS).toBe(3);
  });

  it("allows selected products to be removed at the selection limit", () => {
    expect(canSelectForComparison([1, 2, 3], 2)).toBe(true);
    expect(canSelectForComparison([1, 2, 3], 4)).toBe(false);
  });

  it("adds a compared product to the cart without overwriting an existing quantity", () => {
    expect(addComparedProductToCart([1], { 1: 2 }, 2)).toEqual({ cart: [1, 2], quantities: { 1: 2, 2: 1 } });
    expect(addComparedProductToCart([1, 2], { 2: 3 }, 2)).toEqual({ cart: [1, 2], quantities: { 2: 3 } });
  });
});
