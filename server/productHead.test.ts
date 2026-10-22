import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ getProductById: vi.fn() }));

import { getProductById } from "./db";
import { getProductHeadMetadata, injectProductHeadMetadata, renderHtmlWithProductHead } from "./productHead";
import { buildProductJsonLd } from "../shared/productSchema";

describe("injectProductHeadMetadata", () => {
  it("resolves active public product metadata for a product-detail request", async () => {
    vi.mocked(getProductById).mockResolvedValueOnce({
      id: 14,
      name: "Daily Omega",
      description: "Support for daily wellness.",
      category: "Supplement",
      price: "150000.00",
      stock: 3,
      isActive: true,
      targetSegment: "all",
    } as any);

    await expect(getProductHeadMetadata("/products/14?campaign=search")).resolves.toMatchObject({
      title: "Daily Omega | MCI One More",
      description: "Support for daily wellness.",
      canonicalUrl: "https://mcionemore.com/products/14",
      productSchema: { "@type": "Product", offers: { availability: "https://schema.org/InStock" } },
    });
  });

  it("resolves slug product requests with a slug canonical URL", async () => {
    await expect(
      getProductHeadMetadata("/products/omega-balance", async () => ({
        id: 15,
        slug: "omega-balance",
        name: "Omega Balance",
        description: "Daily wellness support.",
        category: "Supplement",
        price: "150000.00",
        stock: 4,
        isActive: true,
        targetSegment: "all",
      } as any)),
    ).resolves.toMatchObject({
      canonicalUrl: "https://mcionemore.com/products/omega-balance",
      productSchema: { url: "https://mcionemore.com/products/omega-balance" },
    });
  });

  it("replaces generic head tags with escaped product-specific metadata", () => {
    const page = injectProductHeadMetadata(
      '<head><title>MCI One More - Trusted Health Partner</title><meta name="description" content="Generic" /></head>',
      {
        title: 'Vitamin "C" | MCI One More', description: "Wellness & immune support", canonicalUrl: "https://mcionemore.com/products/9",
        productSchema: buildProductJsonLd({ id: 9, name: 'Vitamin "C"', description: "Wellness & immune support", category: "Wellness", price: 50000, stock: 3 }),
      }
    );

    expect(page).toContain("<title>Vitamin &quot;C&quot; | MCI One More</title>");
    expect(page).toContain('content="Wellness &amp; immune support"');
    expect(page).toContain('<link rel="canonical" href="https://mcionemore.com/products/9" />');
    expect(page).toContain('data-product-schema="true"');
    expect(page).not.toContain("Trusted Health Partner");
  });

  it("returns raw product HTML with unique metadata before client hydration", async () => {
    const rawHtml = await renderHtmlWithProductHead(
      '<!doctype html><html><head><title>MCI One More - Trusted Health Partner</title><meta name="description" content="Generic" /></head><body><div id="root"></div></body></html>',
      "/products/55",
      async () => ({
        id: 55,
        name: "Calm Night Formula",
        description: "Night-time wellness support.",
        category: "Wellness",
        price: "85000.00",
        stock: 0,
        isActive: true,
        targetSegment: "standard",
      } as any)
    );

    expect(rawHtml).toContain("<title>Calm Night Formula | MCI One More</title>");
    expect(rawHtml).toContain('content="Night-time wellness support."');
    expect(rawHtml).toContain('<link rel="canonical" href="https://mcionemore.com/products/55" />');
    expect(rawHtml).toContain('"availability":"https://schema.org/OutOfStock"');
  });
});
