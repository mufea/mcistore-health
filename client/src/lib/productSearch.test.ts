import { describe, expect, it } from "vitest";
import { buildCatalogSearchPath, getCatalogSearchTerm } from "./productSearch";

describe("product search paths", () => {
  it("sends a trimmed query to the catalog URL", () => {
    expect(buildCatalogSearchPath("  Painless Night  ")).toBe("/products?search=Painless%20Night");
  });

  it("uses the catalog root for an empty query and reads a catalog query", () => {
    expect(buildCatalogSearchPath("  ")).toBe("/products");
    expect(getCatalogSearchTerm("?category=wellness&search=Painless%20Night")).toBe("Painless Night");
  });
});
