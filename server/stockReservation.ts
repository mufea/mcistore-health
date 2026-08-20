import { finalizeStockReservation, releaseOrderStockReservation } from "./db";

/** Applies a payment outcome to one reservation; both helpers are idempotent. */
export async function applyPaymentReservationOutcome(
  orderId: number,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
) {
  if (paymentStatus === "paid") return finalizeStockReservation(orderId);
  if (paymentStatus === "failed" || paymentStatus === "refunded") return releaseOrderStockReservation(orderId);
  return false;
}
