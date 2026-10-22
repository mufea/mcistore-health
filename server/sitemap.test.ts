import { describe, expect, it } from "vitest";
import { buildSitemapXml } from "./sitemap";

describe("buildSitemapXml", () => {
  it("includes canonical discovery pages and active product detail URLs", () => {
    const sitemap = buildSitemapXml([
      { id: 17, slug: "omega-balance", updatedAt: new Date("2026-08-18T08:00:00.000Z") },
      { id: 29, slug: "vitamin-c-500-mg", updatedAt: new Date("2026-08-19T08:00:00.000Z") },
    ], new Date("2026-08-20T08:00:00.000Z"));

    expect(sitemap).toContain("https://mcionemore.com/products/omega-balance");
    expect(sitemap).toContain("https://mcionemore.com/products/vitamin-c-500-mg");
    expect(sitemap).toContain("https://mcionemore.com/survey");
    expect(sitemap).not.toContain("track-order");
  });
});
