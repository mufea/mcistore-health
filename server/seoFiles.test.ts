import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = resolve(process.cwd(), "client/public");

describe("public SEO index files", () => {
  it("exposes crawler rules and points robots to the canonical sitemap", () => {
    const robots = readFileSync(resolve(publicDir, "robots.txt"), "utf8");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Disallow: /admin/");
    expect(robots).toContain("Disallow: /track-order");
    expect(robots).toContain("Sitemap: https://mcionemore.com/sitemap.xml");
  });

  it("keeps sitemap generation server-side so live products are included", () => {
    expect(() => readFileSync(resolve(publicDir, "sitemap.xml"), "utf8")).toThrow();
  });
});
