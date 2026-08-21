import { removeCartItem, type ProductQuantities } from "./cartQuantities";

export function removeCheckoutProduct(
  checkoutProductIds: number[],
  checkoutQuantities: ProductQuantities,
  storedCartIds: number[],
  storedQuantities: ProductQuantities,
  productId: number,
) {
  const checkout = removeCartItem(checkoutProductIds, checkoutQuantities, productId);
  const stored = removeCartItem(storedCartIds, storedQuantities, productId);

  return {
    checkoutProductIds: checkout.cartIds,
    checkoutQuantities: checkout.quantities,
    storedCartIds: stored.cartIds,
    storedQuantities: stored.quantities,
  };
}
