import { describe, expect, it } from "vitest";
import { getProductSuggestions } from "./productSuggestions";

const products = [
  { id: 1, name: "Painless Night Glu", category: "Supplement", description: "Transdermal pain support" },
  { id: 2, name: "Daily Omega", category: "Supplement", description: "Supports cardiovascular wellness" },
  { id: 3, name: "Calm Tea", category: "Herbal", description: "Night-time relaxation" },
];

describe("getProductSuggestions", () => {
  it("prioritizes product-name matches ahead of category and description matches", () => {
    expect(getProductSuggestions(products, "night").map((product) => product.id)).toEqual([1, 3]);
  });

  it("requires two characters and respects the result limit", () => {
    expect(getProductSuggestions(products, "n")).toEqual([]);
    expect(getProductSuggestions(products, "supplement", 1).map((product) => product.id)).toEqual([2]);
  });
});
