export function isReservationExpired(
  reservationStatus: "active" | "released" | "expired" | "fulfilled",
  reservationExpiresAt: Date | null,
  now = new Date(),
) {
  return reservationStatus === "active" && Boolean(reservationExpiresAt && reservationExpiresAt <= now);
}

export function availableStock(stock: number, reservedStock: number) {
  return Math.max(0, stock - reservedStock);
}
