import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRANSDERMAL_NUTRITION,
  isValidTransdermalNutrition,
  parseTransdermalNutrition,
  serializeTransdermalNutrition,
  TRANSDERMAL_LANGUAGES,
} from "./transdermalNutrition";

describe("transdermal nutrition settings", () => {
  it("falls back to safe defaults when no setting exists", () => {
    expect(parseTransdermalNutrition()).toEqual(DEFAULT_TRANSDERMAL_NUTRITION);
  });

  it("round-trips valid content", () => {
    const value = { ...DEFAULT_TRANSDERMAL_NUTRITION, enabled: false };
    expect(parseTransdermalNutrition(serializeTransdermalNutrition(value))).toEqual(value);
  });

  it("rejects invalid image URLs and incorrect item counts", () => {
    expect(isValidTransdermalNutrition({ ...DEFAULT_TRANSDERMAL_NUTRITION, images: [{ ...DEFAULT_TRANSDERMAL_NUTRITION.images[0], url: "javascript:alert(1)" }] })).toBe(false);
    expect(isValidTransdermalNutrition({ ...DEFAULT_TRANSDERMAL_NUTRITION, images: [...DEFAULT_TRANSDERMAL_NUTRITION.images, ...DEFAULT_TRANSDERMAL_NUTRITION.images, DEFAULT_TRANSDERMAL_NUTRITION.images[0]] })).toBe(false);
  });

  it("round-trips all six language editors and consultation settings", () => {
    const value = {
      ...DEFAULT_TRANSDERMAL_NUTRITION,
      contact: { ...DEFAULT_TRANSDERMAL_NUTRITION.contact, url: "https://wa.me/6281234567890" },
      content: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, { ...DEFAULT_TRANSDERMAL_NUTRITION.content[language], title: `${language} nutrition` }])) as typeof DEFAULT_TRANSDERMAL_NUTRITION.content,
    };
    const parsed = parseTransdermalNutrition(serializeTransdermalNutrition(value));
    expect(parsed.content.ar.title).toBe("ar nutrition");
    expect(parsed.content.zh.title).toBe("zh nutrition");
    expect(parsed.contact.url).toBe("https://wa.me/6281234567890");
  });

  it("migrates the previous single-image format safely", () => {
    const legacy = {
      enabled: true,
      imageUrl: "/legacy.webp",
      imageAlt: "Legacy image",
      items: DEFAULT_TRANSDERMAL_NUTRITION.content.en.items,
      note: "Legacy note",
    };
    const parsed = parseTransdermalNutrition(JSON.stringify(legacy));
    expect(parsed.images).toHaveLength(1);
    expect(parsed.images[0].url).toBe("/legacy.webp");
    expect(parsed.content.en.note).toBe("Legacy note");
  });
});
