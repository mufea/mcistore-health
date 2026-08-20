import { describe, expect, it } from "vitest";
import { buildSitemapXml } from "./sitemap";

describe("buildSitemapXml", () => {
  it("includes canonical discovery pages and active product detail URLs", () => {
    const sitemap = buildSitemapXml([
      { id: 17, updatedAt: new Date("2026-08-18T08:00:00.000Z") },
      { id: 29, updatedAt: new Date("2026-08-19T08:00:00.000Z") },
    ], new Date("2026-08-20T08:00:00.000Z"));

    expect(sitemap).toContain("https://mci-store.com/products/17");
    expect(sitemap).toContain("https://mci-store.com/products/29");
    expect(sitemap).toContain("https://mci-store.com/survey");
    expect(sitemap).not.toContain("track-order");
  });
});
