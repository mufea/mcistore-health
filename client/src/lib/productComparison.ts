export const MAX_COMPARISON_PRODUCTS = 3;

export function toggleComparedProduct(selectedIds: number[], productId: number) {
  if (selectedIds.includes(productId)) return selectedIds.filter((id) => id !== productId);
  if (selectedIds.length >= MAX_COMPARISON_PRODUCTS) return selectedIds;
  return [...selectedIds, productId];
}

export function canSelectForComparison(selectedIds: number[], productId: number) {
  return selectedIds.includes(productId) || selectedIds.length < MAX_COMPARISON_PRODUCTS;
}

export function addComparedProductToCart(
  cart: number[],
  quantities: Record<number, number>,
  productId: number
) {
  return {
    cart: cart.includes(productId) ? cart : [...cart, productId],
    quantities: { ...quantities, [productId]: quantities[productId] ?? 1 },
  };
}

export function buildAlternativeCheckoutPath(productId: number, segment: string) {
  return `/checkout?products=${productId}&segment=${encodeURIComponent(segment)}&quantities=${encodeURIComponent(`${productId}:1`)}`;
}
