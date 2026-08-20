import { availableStock } from "./reservationPolicy";

type ProductStockRow = { stock: number; reservedStock: number };

/** Production customer product-read path: clean expired holds, then return available stock. */
export async function getProducts<T extends ProductStockRow>(
  releaseExpiredReservations: () => Promise<void>,
  loadProducts: () => Promise<T[]>,
) {
  await releaseExpiredReservations();
  const products = await loadProducts();
  return products.map((product) => ({ ...product, stock: availableStock(product.stock, product.reservedStock) }));
}
