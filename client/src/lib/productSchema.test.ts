import { describe, expect, it } from "vitest";
import { buildProductJsonLd, serializeProductJsonLd } from "./productSchema";

describe("buildProductJsonLd", () => {
  it("uses live product data without unsupported ratings or reviews", () => {
    const schema = buildProductJsonLd({
      id: 18,
      name: "Calm Night Formula",
      description: "Restful <night> support.",
      price: "990000.00",
      category: "Wellness",
      imageUrl: "/manus-storage/calm.jpg",
      images: [{ url: "/manus-storage/calm.jpg" }, { url: "/manus-storage/calm-detail.jpg" }],
      stock: 4,
    });

    expect(schema).toMatchObject({
      "@type": "Product",
      name: "Calm Night Formula",
      url: "https://mci-store.com/products/18",
      image: ["/manus-storage/calm.jpg", "/manus-storage/calm-detail.jpg"],
      offers: { price: "990000", priceCurrency: "IDR", availability: "https://schema.org/InStock" },
    });
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("review");
  });

  it("uses out-of-stock availability and safely serializes script content", () => {
    const serialized = serializeProductJsonLd(buildProductJsonLd({
      id: 19,
      name: "<Safe Product>",
      price: 50000,
      category: "Wellness",
      stock: 0,
    }));

    expect(serialized).toContain("https://schema.org/OutOfStock");
    expect(serialized).toContain("\\u003cSafe Product\\u003e");
    expect(serialized).not.toContain("<Safe Product>");
  });
});
