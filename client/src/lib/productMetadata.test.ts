import { describe, expect, it } from "vitest";
import { buildProductMetadata } from "./productMetadata";

describe("buildProductMetadata", () => {
  it("creates a unique product title and normalized description", () => {
    expect(buildProductMetadata({ name: "Omega Balance", description: "  Daily   nutritional   support. ", category: "Supplement" })).toEqual({
      title: "Omega Balance | MCI Store",
      description: "Daily nutritional support.",
    });
  });

  it("uses a product-specific fallback and limits long descriptions", () => {
    const metadata = buildProductMetadata({ name: "Vital Tea", category: "Herbal Tea", description: "a".repeat(200) });
    expect(metadata.description).toHaveLength(160);
    expect(metadata.description.endsWith("…")).toBe(true);
    expect(buildProductMetadata({ name: "Vital Tea", category: "Herbal Tea" }).description).toContain("Vital Tea");
  });
});
