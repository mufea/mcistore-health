import { describe, expect, it } from "vitest";
import { getSuggestionState } from "./homeSuggestions";

describe("getSuggestionState", () => {
  it("does not present an empty state while the product query is pending or failed", () => {
    expect(getSuggestionState({ query: "pa", isLoading: true, isError: false, count: 0 })).toBe("loading");
    expect(getSuggestionState({ query: "pa", isLoading: false, isError: true, count: 0 })).toBe("error");
  });

  it("uses empty only after a successful query and requires two characters", () => {
    expect(getSuggestionState({ query: "p", isLoading: false, isError: false, count: 3 })).toBe("idle");
    expect(getSuggestionState({ query: "pa", isLoading: false, isError: false, count: 0 })).toBe("empty");
    expect(getSuggestionState({ query: "pa", isLoading: false, isError: false, count: 1 })).toBe("results");
  });
});
