import { describe, expect, it } from "vitest";
import { formatReservationCountdown, isReservationNearExpiry, remainingReservationMs, reservationProgressPercent } from "./reservationTimer";

describe("reservationTimer", () => {
  it("calculates remaining time and never returns a negative value", () => {
    expect(remainingReservationMs("2026-08-20T10:10:00.000Z", Date.parse("2026-08-20T10:00:00.000Z"))).toBe(600_000);
    expect(remainingReservationMs("2026-08-20T09:59:00.000Z", Date.parse("2026-08-20T10:00:00.000Z"))).toBe(0);
  });

  it("formats the countdown with two-digit minutes and seconds", () => {
    expect(formatReservationCountdown(610_000)).toBe("10:10");
    expect(formatReservationCountdown(0)).toBe("00:00");
  });

  it("clamps reservation progress to the valid percentage range", () => {
    expect(reservationProgressPercent(300_000)).toBe(50);
    expect(reservationProgressPercent(900_000)).toBe(100);
    expect(reservationProgressPercent(-1)).toBe(0);
  });

  it("identifies the last two minutes without flagging an expired reservation", () => {
    expect(isReservationNearExpiry(120_000)).toBe(true);
    expect(isReservationNearExpiry(120_001)).toBe(false);
    expect(isReservationNearExpiry(0)).toBe(false);
  });
});
