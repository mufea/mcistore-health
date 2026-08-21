const CANONICAL_ORIGIN = "https://mci-store.com";

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MCI Store",
    alternateName: "MCI Store - Trusted Health Partner",
    url: CANONICAL_ORIGIN,
    logo: `${CANONICAL_ORIGIN}/manus-storage/favicon-256_fb59f03b.png`,
    description: "Your journey to optimal health starts here. Discover personalized health products tailored to your unique needs.",
  };
}

export function serializeOrganizationJsonLd(schema: ReturnType<typeof buildOrganizationJsonLd> = buildOrganizationJsonLd()) {
  return JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
