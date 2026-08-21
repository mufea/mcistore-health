import { describe, expect, it } from "vitest";
import { injectOrganizationSchema, renderHtmlWithRouteStructuredData } from "./organizationHead";

describe("Organization schema injection", () => {
  it("adds one accurate Organization JSON-LD script to the home HTML", () => {
    const page = injectOrganizationSchema("<html><head><title>MCI Store</title></head><body></body></html>");
    expect(page).toContain('data-organization-schema="true"');
    expect(page).toContain('"@type":"Organization"');
    expect(page).toContain('"url":"https://mci-store.com"');
    expect((page.match(/data-organization-schema="true"/g) ?? [])).toHaveLength(1);
  });

  it("serves Organization markup only on the home route", async () => {
    const template = "<html><head><title>MCI Store</title><meta name=\"description\" content=\"Generic\" /></head><body></body></html>";
    await expect(renderHtmlWithRouteStructuredData(template, "/")).resolves.toContain('data-organization-schema="true"');
    await expect(renderHtmlWithRouteStructuredData(template, "/products/3", async () => null)).resolves.not.toContain('data-organization-schema="true"');
  });
});
