import { describe, expect, it } from "vitest";
import { addComparedProductToCart, buildAlternativeCheckoutPath, canSelectForComparison, MAX_COMPARISON_PRODUCTS, toggleComparedProduct } from "./productComparison";

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

  it("builds a direct checkout URL for a selected alternative", () => {
    expect(buildAlternativeCheckoutPath(8, "premium care")).toBe("/checkout?products=8&segment=premium%20care&quantities=8%3A1");
  });
});
