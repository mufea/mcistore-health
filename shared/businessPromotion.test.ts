import { describe, expect, it } from "vitest";
import {
  DEFAULT_BUSINESS_OPPORTUNITY_SLIDES,
  isValidBusinessOpportunitySlides,
  parseBusinessOpportunitySlides,
  serializeBusinessOpportunitySlides,
} from "./businessPromotion";

describe("business promotion settings", () => {
  it("falls back to the built-in carousel when no setting exists", () => {
    expect(parseBusinessOpportunitySlides()).toEqual(DEFAULT_BUSINESS_OPPORTUNITY_SLIDES);
    expect(DEFAULT_BUSINESS_OPPORTUNITY_SLIDES).toHaveLength(10);
  });

  it("parses valid local and remote image URLs", () => {
    const value = JSON.stringify([
      { full: "/manus-storage/slide.webp", mobile: "https://cdn.example.com/slide-mobile.webp" },
    ]);
    expect(parseBusinessOpportunitySlides(value)).toEqual([
      { full: "/manus-storage/slide.webp", mobile: "https://cdn.example.com/slide-mobile.webp" },
    ]);
  });

  it("rejects malformed URLs and more than twenty slides", () => {
    expect(isValidBusinessOpportunitySlides(JSON.stringify([{ full: "javascript:alert(1)" }]))).toBe(false);
    expect(isValidBusinessOpportunitySlides(JSON.stringify(Array.from({ length: 21 }, () => ({ full: "/slide.webp" }))))).toBe(false);
  });

  it("round-trips serialized carousel settings", () => {
    const slides = [{ full: "/slide.webp", mobile: "/slide-mobile.webp" }];
    expect(parseBusinessOpportunitySlides(serializeBusinessOpportunitySlides(slides))).toEqual(slides);
  });
});
