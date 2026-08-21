import { describe, expect, it, vi } from "vitest";
import { executeSuggestionCartAction } from "./homeSuggestionCart";

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    values,
  };
}

describe("auto-suggest Add to Cart action integration", () => {
  it("persists an authenticated add and invokes the success UI callback", () => {
    const storage = createStorage();
    const callbacks = { onAdded: vi.fn(), onRequireSignIn: vi.fn(), onUnavailable: vi.fn() };

    expect(executeSuggestionCartAction({ storage, productId: 7, stock: 3, isAuthenticated: true, callbacks })).toMatchObject({ added: true, quantities: { 7: 1 } });
    expect(storage.values.get("pending_cart")).toBe("[7]");
    expect(storage.values.get("pending_quantities")).toBe('{"7":1}');
    expect(callbacks.onAdded).toHaveBeenCalledOnce();
    expect(callbacks.onRequireSignIn).not.toHaveBeenCalled();
  });

  it("persists an unauthenticated add before requesting sign-in", () => {
    const storage = createStorage({ pending_cart: "[7]", pending_quantities: '{"7":1}' });
    const callbacks = { onAdded: vi.fn(), onRequireSignIn: vi.fn(), onUnavailable: vi.fn() };

    expect(executeSuggestionCartAction({ storage, productId: 7, stock: 3, isAuthenticated: false, callbacks })).toMatchObject({ added: true, quantities: { 7: 2 } });
    expect(storage.values.get("pending_quantities")).toBe('{"7":2}');
    expect(storage.values.get("pending_checkout_after_login")).toBe("true");
    expect(callbacks.onRequireSignIn).toHaveBeenCalledOnce();
  });

  it("keeps persisted state unchanged and emits the stock failure reason", () => {
    const storage = createStorage({ pending_cart: "[7]", pending_quantities: '{"7":2}' });
    const callbacks = { onAdded: vi.fn(), onRequireSignIn: vi.fn(), onUnavailable: vi.fn() };

    expect(executeSuggestionCartAction({ storage, productId: 7, stock: 2, isAuthenticated: true, callbacks })).toMatchObject({ added: false, reason: "stock_limit" });
    expect(storage.values.get("pending_quantities")).toBe('{"7":2}');
    expect(callbacks.onUnavailable).toHaveBeenCalledWith("stock_limit");
    expect(callbacks.onAdded).not.toHaveBeenCalled();
  });
});
