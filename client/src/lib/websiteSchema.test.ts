import { describe, expect, it } from "vitest";
import { buildWebsiteJsonLd } from "./websiteSchema";

describe("buildWebsiteJsonLd", () => {
  it("declares the actual catalog search endpoint", () => {
    expect(buildWebsiteJsonLd()).toMatchObject({
      "@type": "WebSite",
      url: "https://mcionemore.com",
      potentialAction: {
        "@type": "SearchAction",
        target: { urlTemplate: "https://mcionemore.com/products?search={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    });
  });
});
