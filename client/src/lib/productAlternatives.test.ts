import { describe, expect, it } from "vitest";
import { filterAlternativesByNeed, filterAlternativesByText, getAlternativeNeeds, getInStockAlternatives, shouldShowAlternativeSearch } from "./productAlternatives";

describe("getInStockAlternatives", () => {
  const current = { id: 1, name: "Current", category: "Vitamins", stock: 0, isFeatured: false };
  const products = [
    current,
    { id: 2, name: "Daily Energy", description: "Natural vitality support", category: "Vitamins", stock: 4, isFeatured: false, tags: ["Energy"] },
    { id: 3, name: "Immune Plus", description: "Daily immune care", category: "Vitamins", stock: 2, isFeatured: true, tags: ["Energy", "Immune"] },
    { id: 4, name: "Sleep Ease", description: "Restful sleep support", category: "Wellness", stock: 8, isFeatured: true, tags: ["Sleep"] },
    { id: 5, name: "Sold Out", category: "Vitamins", stock: 0, isFeatured: true },
  ];

  it("returns only available alternatives, prioritizing similar featured products", () => {
    expect(getInStockAlternatives(current, products).map((item) => item.id)).toEqual([3, 2, 4]);
  });

  it("honors the requested result limit", () => {
    expect(getInStockAlternatives(current, products, 2).map((item) => item.id)).toEqual([3, 2]);
  });

  it("derives need filters and narrows alternatives by the selected need", () => {
    const alternatives = getInStockAlternatives(current, products);
    expect(getAlternativeNeeds(alternatives)).toEqual(["Energy", "Immune", "Sleep"]);
    expect(filterAlternativesByNeed(alternatives, "Energy").map((item) => item.id)).toEqual([3, 2]);
    expect(filterAlternativesByNeed(alternatives, "all").map((item) => item.id)).toEqual([3, 2, 4]);
  });

  it("finds alternatives by name, description, or need tag", () => {
    const alternatives = getInStockAlternatives(current, products);
    expect(filterAlternativesByText(alternatives, "daily").map((item) => item.id)).toEqual([3, 2]);
    expect(filterAlternativesByText(alternatives, "sleep").map((item) => item.id)).toEqual([4]);
    expect(filterAlternativesByText(alternatives, "immune").map((item) => item.id)).toEqual([3]);
  });

  it("keeps text search available even when alternatives have no need tags", () => {
    const untagged = [{ id: 9, name: "Simple Wellness", category: "Wellness", stock: 3, isFeatured: false }];
    expect(shouldShowAlternativeSearch(true, untagged.length)).toBe(true);
    expect(filterAlternativesByText(untagged, "wellness").map((item) => item.id)).toEqual([9]);
    expect(shouldShowAlternativeSearch(false, untagged.length)).toBe(false);
  });
});
