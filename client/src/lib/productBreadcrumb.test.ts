import { describe, expect, it } from "vitest";
import { buildProductBreadcrumbItems } from "./productBreadcrumb";

describe("buildProductBreadcrumbItems", () => {
  it("creates catalog and product-detail hierarchy with only the current item non-linking", () => {
    expect(buildProductBreadcrumbItems("Home", "Products", "Painless Night Glu")).toEqual([
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Painless Night Glu" },
    ]);
  });

  it("marks the catalog as the current item when no product is provided", () => {
    expect(buildProductBreadcrumbItems("Home", "Products")).toEqual([
      { label: "Home", href: "/" },
      { label: "Products" },
    ]);
  });
});
