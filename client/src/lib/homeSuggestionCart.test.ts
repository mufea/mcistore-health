import { describe, expect, it } from "vitest";
import { addSuggestionProductToCart, getSuggestionCartPostAddAction, persistSuggestionProductCart } from "./homeSuggestionCart";

describe("addSuggestionProductToCart", () => {
  it("adds a new item and increments an existing item without exceeding stock", () => {
    expect(addSuggestionProductToCart([], {}, 7, 3)).toEqual({ cart: [7], quantities: { 7: 1 }, added: true });
    expect(addSuggestionProductToCart([7], { 7: 1 }, 7, 3)).toEqual({ cart: [7], quantities: { 7: 2 }, added: true });
  });

  it("rejects unavailable products and cart quantities at the stock limit", () => {
    expect(addSuggestionProductToCart([], {}, 7, 0)).toMatchObject({ added: false, reason: "out_of_stock" });
    expect(addSuggestionProductToCart([7], { 7: 2 }, 7, 2)).toMatchObject({ added: false, reason: "stock_limit" });
  });

  it("uses safe parsers and persists a normalized cart even when prior storage is malformed", () => {
    const values = new Map<string, string>([["pending_cart", "not-json"], ["pending_quantities", "{bad-json"]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(persistSuggestionProductCart(storage, 7, 3)).toMatchObject({ added: true, cart: [7], quantities: { 7: 1 } });
    expect(values.get("pending_cart")).toBe("[7]");
    expect(values.get("pending_quantities")).toBe('{"7":1}');
  });

  it("does not alter stored cart state when stock prevents the addition and exposes the correct post-add action", () => {
    const values = new Map<string, string>([["pending_cart", "[7]"], ["pending_quantities", '{"7":2}']]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(persistSuggestionProductCart(storage, 7, 2)).toMatchObject({ added: false, reason: "stock_limit" });
    expect(values.get("pending_cart")).toBe("[7]");
    expect(getSuggestionCartPostAddAction(true)).toBe("show_success");
    expect(getSuggestionCartPostAddAction(false)).toBe("redirect_to_sign_in");
  });
});
