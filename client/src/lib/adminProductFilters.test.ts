import { describe, expect, it } from "vitest";
import { filterAdminProducts } from "./adminProductFilters";

const products = [
  { id: 1, name: "Daily Omega", category: "Supplement", isActive: true },
  { id: 2, name: "Night Balance", category: "Supplement", isActive: false },
  { id: 3, name: "Calm Essential Oil", category: "Essential Oil", isActive: true },
];

describe("filterAdminProducts", () => {
  it("returns all products by default", () => {
    expect(filterAdminProducts(products, "", "all").map((product) => product.id)).toEqual([1, 2, 3]);
  });

  it("filters active and inactive products", () => {
    expect(filterAdminProducts(products, "", "active").map((product) => product.id)).toEqual([1, 3]);
    expect(filterAdminProducts(products, "", "inactive").map((product) => product.id)).toEqual([2]);
  });

  it("combines status filtering with a case-insensitive name or category search", () => {
    expect(filterAdminProducts(products, "oil", "active").map((product) => product.id)).toEqual([3]);
    expect(filterAdminProducts(products, "supplement", "inactive").map((product) => product.id)).toEqual([2]);
  });
});
