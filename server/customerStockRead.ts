/** Ensures expired holds are released before getProducts returns customer availability. */
export async function getProductsAfterReservationCleanup<T>(
  releaseExpiredReservations: () => Promise<void>,
  readAvailability: () => Promise<T>,
) {
  await releaseExpiredReservations();
  return readAvailability();
}

export const readCustomerStockAfterCleanup = getProductsAfterReservationCleanup;
