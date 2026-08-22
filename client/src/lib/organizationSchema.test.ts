import { describe, expect, it } from "vitest";
import { buildOrganizationJsonLd, serializeOrganizationJsonLd } from "./organizationSchema";

describe("buildOrganizationJsonLd", () => {
  it("uses the official MCI Store brand and canonical domain", () => {
    expect(buildOrganizationJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "MCI Store",
      alternateName: "MCI Store - Trusted Health Partner",
      url: "https://mci-store.com",
      logo: "https://mci-store.com/manus-storage/mci-health-mark_0e17589e.png",
      description: "Your journey to optimal health starts here. Discover personalized health products tailored to your unique needs.",
    });
  });

  it("serializes a safe JSON-LD payload", () => {
    const schema = JSON.parse(serializeOrganizationJsonLd());
    expect(schema).toMatchObject({ "@type": "Organization", name: "MCI Store" });
    expect(schema.logo).toContain("mci-health-mark_0e17589e.png");
  });
});
