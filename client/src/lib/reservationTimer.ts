export function remainingReservationMs(expiresAt: Date | string | null | undefined, now = Date.now()) {
  if (!expiresAt) return 0;
  const expiry = new Date(expiresAt).getTime();
  return Number.isFinite(expiry) ? Math.max(0, expiry - now) : 0;
}

export function formatReservationCountdown(remainingMs: number) {
  const totalSeconds = Math.ceil(Math.max(0, remainingMs) / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
