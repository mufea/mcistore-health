import { describe, expect, it } from "vitest";
import { buildProductCanonicalUrl, buildProductMetadata } from "./productMetadata";

describe("buildProductMetadata", () => {
  it("creates a unique product title and normalized description", () => {
    expect(buildProductMetadata({ name: "Omega Balance", description: "  Daily   nutritional   support. ", category: "Supplement" })).toEqual({
      title: "Omega Balance | MCI One More",
      description: "Daily nutritional support.",
    });
  });

  it("uses a product-specific fallback and limits long descriptions", () => {
    const metadata = buildProductMetadata({ name: "Vital Tea", category: "Herbal Tea", description: "a".repeat(200) });
    expect(metadata.description).toHaveLength(160);
    expect(metadata.description.endsWith("…")).toBe(true);
    expect(buildProductMetadata({ name: "Vital Tea", category: "Herbal Tea" }).description).toContain("Vital Tea");
  });

  it("uses the preferred storefront domain for a product canonical URL", () => {
    expect(buildProductCanonicalUrl(42)).toBe("https://mcionemore.com/products/42");
  });
});
