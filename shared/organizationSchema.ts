import { MCI_BRAND_MARK_URL } from "./brand";

const CANONICAL_ORIGIN = "https://mcionemore.com";

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MCI One More",
    alternateName: "MCI One More - Trusted Health Partner",
    url: CANONICAL_ORIGIN,
    logo: MCI_BRAND_MARK_URL,
    description: "Your journey to optimal health starts here. Discover personalized health products tailored to your unique needs.",
  };
}

export function serializeOrganizationJsonLd(schema: ReturnType<typeof buildOrganizationJsonLd> = buildOrganizationJsonLd()) {
  return JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
