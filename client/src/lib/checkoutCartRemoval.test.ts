import { describe, expect, it } from "vitest";
import { removeCheckoutProduct } from "./checkoutCartRemoval";

describe("removeCheckoutProduct", () => {
  it("removes the selected checkout item while preserving unrelated stored-cart items", () => {
    expect(removeCheckoutProduct([1, 2], { 1: 1, 2: 3 }, [1, 2, 9], { 1: 1, 2: 3, 9: 2 }, 2)).toEqual({
      checkoutProductIds: [1],
      checkoutQuantities: { 1: 1 },
      storedCartIds: [1, 9],
      storedQuantities: { 1: 1, 9: 2 },
    });
  });
});
