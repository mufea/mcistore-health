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

type CartPriceProduct = { id: number; price: string | number };

export function getAlternativeCartSummary(
  products: CartPriceProduct[],
  cartIds: number[],
  quantities: Record<number, number>
) {
  const cartIdSet = new Set(cartIds);
  const selectedProducts = products.filter((product) => cartIdSet.has(product.id));
  const itemCount = selectedProducts.reduce((sum, product) => sum + Math.max(1, quantities[product.id] ?? 1), 0);
  const total = selectedProducts.reduce((sum, product) => sum + Number(product.price) * Math.max(1, quantities[product.id] ?? 1), 0);
  return { productIds: selectedProducts.map((product) => product.id), itemCount, total };
}

export function buildMultiProductCheckoutPath(productIds: number[], segment: string, quantities: Record<number, number>) {
  const quantityQuery = productIds.map((id) => `${id}:${Math.max(1, quantities[id] ?? 1)}`).join(",");
  return `/checkout?products=${productIds.join(",")}&segment=${encodeURIComponent(segment)}&quantities=${encodeURIComponent(quantityQuery)}`;
}
