const CANONICAL_ORIGIN = "https://mcionemore.com";

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MCI One More",
    url: CANONICAL_ORIGIN,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${CANONICAL_ORIGIN}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function serializeWebsiteJsonLd(schema: ReturnType<typeof buildWebsiteJsonLd> = buildWebsiteJsonLd()) {
  return JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
