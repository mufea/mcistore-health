import { describe, expect, it } from "vitest";
import { buildWebsiteJsonLd } from "./websiteSchema";

describe("buildWebsiteJsonLd", () => {
  it("declares the actual catalog search endpoint", () => {
    expect(buildWebsiteJsonLd()).toMatchObject({
      "@type": "WebSite",
      url: "https://mci-store.com",
      potentialAction: {
        "@type": "SearchAction",
        target: { urlTemplate: "https://mci-store.com/products?search={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    });
  });
});
