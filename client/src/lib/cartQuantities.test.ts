import { describe, expect, it } from "vitest";
import { parseCheckoutQuantities, parseStoredCartIds, parseStoredQuantities, removeCartItem, resolveCheckoutQuantities } from "./cartQuantities";

describe("checkout quantity resolution", () => {
  it("uses query quantities before persisted cart quantities", () => {
    const resolved = resolveCheckoutQuantities(
      [101, 202],
      parseCheckoutQuantities("101:3"),
      parseStoredQuantities('{"101":2,"202":4}'),
    );

    expect(resolved).toEqual({ 101: 3, 202: 4 });
  });

  it("rejects invalid quantities and defaults selected products to one", () => {
    const resolved = resolveCheckoutQuantities(
      [101, 202],
      parseCheckoutQuantities("101:0,202:not-a-number"),
      parseStoredQuantities("not-json"),
    );

    expect(resolved).toEqual({ 101: 1, 202: 1 });
  });

  it("reads only valid, unique product IDs from persisted cart storage", () => {
    expect(parseStoredCartIds("[101, 202, 101, 0, \"invalid\"]")).toEqual([101, 202]);
  });

  it("removes an item and its quantity without changing other cart entries", () => {
    expect(removeCartItem([101, 202], { 101: 3, 202: 2 }, 101)).toEqual({
      cartIds: [202],
      quantities: { 202: 2 },
    });
  });
});
