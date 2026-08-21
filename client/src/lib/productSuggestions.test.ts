import { describe, expect, it } from "vitest";
import { formatSuggestionPrice, getProductSuggestionImage, getProductSuggestions } from "./productSuggestions";

const products = [
  { id: 1, name: "Painless Night Glu", category: "Supplement", price: "990000", description: "Transdermal pain support" },
  { id: 2, name: "Daily Omega", category: "Supplement", price: "250000", description: "Supports cardiovascular wellness" },
  { id: 3, name: "Calm Tea", category: "Herbal", price: "125000", description: "Night-time relaxation" },
];

describe("getProductSuggestions", () => {
  it("prioritizes product-name matches ahead of category and description matches", () => {
    expect(getProductSuggestions(products, "night").map((product) => product.id)).toEqual([1, 3]);
  });

  it("requires two characters and respects the result limit", () => {
    expect(getProductSuggestions(products, "n")).toEqual([]);
    expect(getProductSuggestions(products, "supplement", 1).map((product) => product.id)).toEqual([2]);
  });

  it("prioritizes gallery thumbnails and falls back to the primary image or null", () => {
    expect(getProductSuggestionImage({ id: 4, name: "A", category: "Wellness", price: 1, imageUrl: "/primary.jpg", images: [{ url: "/gallery.jpg" }] })).toBe("/gallery.jpg");
    expect(getProductSuggestionImage({ id: 5, name: "B", category: "Wellness", price: 1, imageUrl: "/primary.jpg" })).toBe("/primary.jpg");
    expect(getProductSuggestionImage({ id: 6, name: "C", category: "Wellness", price: 1 })).toBeNull();
  });

  it("formats numeric price data consistently in IDR", () => {
    expect(formatSuggestionPrice("990000")).toBe("IDR 990.000");
    expect(formatSuggestionPrice("invalid")).toBe("IDR —");
  });
});
