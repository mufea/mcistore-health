export type BusinessOpportunitySlide = {
  full: string;
  mobile?: string;
};

export const DEFAULT_BUSINESS_OPPORTUNITY_SLIDES: BusinessOpportunitySlide[] = [
  ["1000672755-full_d1cbf96b.webp", "1000672755-480w_ef04786f.webp"],
  ["1000672756-full_5d029cb6.webp", "1000672756-480w_5601f87f.webp"],
  ["1000672757-full_f8944d64.webp", "1000672757-480w_b810b9e7.webp"],
  ["1000672758-full_3d4f0299.webp", "1000672758-480w_7d724a81.webp"],
  ["1000672759-full_f75bb41f.webp", "1000672759-480w_0a3657dd.webp"],
  ["1000672760-full_61699dfe.webp", "1000672760-480w_03c2f8ce.webp"],
  ["1000672761-full_53511608.webp", "1000672761-480w_362a597b.webp"],
  ["1000672762-full_8f45646f.webp", "1000672762-480w_fa7b0d20.webp"],
  ["1000672763-full_70fc4506.webp", "1000672763-480w_8a3eef46.webp"],
  ["1000672764-full_a11b531e.webp", "1000672764-480w_8b732ad0.webp"],
].map(([full, mobile]) => ({
  full: `/manus-storage/${full}`,
  mobile: `/manus-storage/${mobile}`,
}));

const isAllowedImageUrl = (value: string) => {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

export function parseBusinessOpportunitySlides(value?: string | null): BusinessOpportunitySlide[] {
  if (!value?.trim()) return DEFAULT_BUSINESS_OPPORTUNITY_SLIDES;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return DEFAULT_BUSINESS_OPPORTUNITY_SLIDES;
    const slides = parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item) => ({
        full: typeof item.full === "string" ? item.full.trim() : "",
        mobile: typeof item.mobile === "string" ? item.mobile.trim() : undefined,
      }))
      .filter((item) => isAllowedImageUrl(item.full) && (!item.mobile || isAllowedImageUrl(item.mobile)))
      .slice(0, 20);
    return slides.length > 0 ? slides : DEFAULT_BUSINESS_OPPORTUNITY_SLIDES;
  } catch {
    return DEFAULT_BUSINESS_OPPORTUNITY_SLIDES;
  }
}

export function isValidBusinessOpportunitySlides(value: string): boolean {
  if (value.trim() === "") return true;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length > 20) return false;
    return parsed.every((item) => {
      if (!item || typeof item !== "object") return false;
      const slide = item as Record<string, unknown>;
      return typeof slide.full === "string" && isAllowedImageUrl(slide.full) &&
        (slide.mobile === undefined || (typeof slide.mobile === "string" && isAllowedImageUrl(slide.mobile)));
    });
  } catch {
    return false;
  }
}

export function serializeBusinessOpportunitySlides(slides: BusinessOpportunitySlide[]): string {
  return JSON.stringify(slides.slice(0, 20));
}
