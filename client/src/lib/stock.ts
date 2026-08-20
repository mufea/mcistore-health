export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(availableStock: number, threshold = LOW_STOCK_THRESHOLD) {
  return availableStock > 0 && availableStock <= threshold;
}
