export const LOW_STOCK_THRESHOLD = 5;

export function isOutOfStock(availableStock: number) {
  return availableStock <= 0;
}

export function isLowStock(availableStock: number, threshold = LOW_STOCK_THRESHOLD) {
  return availableStock > 0 && availableStock <= threshold;
}

export function matchesStockFilter(availableStock: number, lowStockOnly: boolean) {
  return !lowStockOnly || isLowStock(availableStock);
}
