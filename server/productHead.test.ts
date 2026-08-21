import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ getProductById: vi.fn() }));

import { getProductById } from "./db";
import { getProductHeadMetadata, injectProductHeadMetadata, renderHtmlWithProductHead } from "./productHead";

describe("injectProductHeadMetadata", () => {
  it("resolves active public product metadata for a product-detail request", async () => {
    vi.mocked(getProductById).mockResolvedValueOnce({
      id: 14,
      name: "Daily Omega",
      description: "Support for daily wellness.",
      category: "Supplement",
      isActive: true,
      targetSegment: "all",
    } as any);

    await expect(getProductHeadMetadata("/products/14?campaign=search")).resolves.toEqual({
      title: "Daily Omega | MCI Store",
      description: "Support for daily wellness.",
      canonicalUrl: "https://mci-store.com/products/14",
    });
  });

  it("replaces generic head tags with escaped product-specific metadata", () => {
    const page = injectProductHeadMetadata(
      '<head><title>MCI Store - Trusted Health Partner</title><meta name="description" content="Generic" /></head>',
      { title: 'Vitamin "C" | MCI Store', description: "Wellness & immune support", canonicalUrl: "https://mci-store.com/products/9" }
    );

    expect(page).toContain("<title>Vitamin &quot;C&quot; | MCI Store</title>");
    expect(page).toContain('content="Wellness &amp; immune support"');
    expect(page).toContain('<link rel="canonical" href="https://mci-store.com/products/9" />');
    expect(page).not.toContain("Trusted Health Partner");
  });

  it("returns raw product HTML with unique metadata before client hydration", async () => {
    const rawHtml = await renderHtmlWithProductHead(
      '<!doctype html><html><head><title>MCI Store - Trusted Health Partner</title><meta name="description" content="Generic" /></head><body><div id="root"></div></body></html>',
      "/products/55",
      async () => ({
        id: 55,
        name: "Calm Night Formula",
        description: "Night-time wellness support.",
        category: "Wellness",
        isActive: true,
        targetSegment: "standard",
      } as any)
    );

    expect(rawHtml).toContain("<title>Calm Night Formula | MCI Store</title>");
    expect(rawHtml).toContain('content="Night-time wellness support."');
    expect(rawHtml).toContain('<link rel="canonical" href="https://mci-store.com/products/55" />');
  });
});
