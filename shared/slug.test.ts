import { describe, expect, it } from "vitest";
import { buildProductPath, createProductSlug, slugify } from "./slug";

describe("product slugs", () => {
  it("normalizes names into readable lowercase slugs", () => {
    expect(slugify("  Vitamin C 500 mg! ")).toBe("vitamin-c-500-mg");
  });

  it("uses an ID fallback for names without latin characters", () => {
    expect(createProductSlug("健康产品", 42)).toBe("product-42");
  });

  it("builds an encoded product detail path", () => {
    expect(buildProductPath("painless-night-glu")).toBe("/products/painless-night-glu");
  });
});
