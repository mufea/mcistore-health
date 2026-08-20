export const MAX_COMPARISON_PRODUCTS = 3;

export function toggleComparedProduct(selectedIds: number[], productId: number) {
  if (selectedIds.includes(productId)) return selectedIds.filter((id) => id !== productId);
  if (selectedIds.length >= MAX_COMPARISON_PRODUCTS) return selectedIds;
  return [...selectedIds, productId];
}

export function canSelectForComparison(selectedIds: number[], productId: number) {
  return selectedIds.includes(productId) || selectedIds.length < MAX_COMPARISON_PRODUCTS;
}
