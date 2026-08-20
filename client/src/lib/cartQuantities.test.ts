import { describe, expect, it } from "vitest";
import { parseCheckoutQuantities, parseStoredQuantities, resolveCheckoutQuantities } from "./cartQuantities";

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
});
