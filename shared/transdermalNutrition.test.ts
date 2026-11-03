import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRANSDERMAL_NUTRITION,
  isValidTransdermalNutrition,
  parseTransdermalNutrition,
  serializeTransdermalNutrition,
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
    expect(isValidTransdermalNutrition({ ...DEFAULT_TRANSDERMAL_NUTRITION, imageUrl: "javascript:alert(1)" })).toBe(false);
    expect(isValidTransdermalNutrition({ ...DEFAULT_TRANSDERMAL_NUTRITION, items: DEFAULT_TRANSDERMAL_NUTRITION.items.slice(0, 2) })).toBe(false);
  });
});
