// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AdminProductStatusToggle from "./AdminProductStatusToggle";

it("offers a Deactivate action for an active product", () => {
  const onToggle = vi.fn();

  render(<AdminProductStatusToggle productName="Daily Omega" isActive onToggle={onToggle} />);

  const button = screen.getByRole("button", { name: "Deactivate Daily Omega" });
  expect(button.textContent).toContain("Deactivate");
  expect(button.getAttribute("aria-pressed")).toBe("true");

  fireEvent.click(button);
  expect(onToggle).toHaveBeenCalledTimes(1);
});

it("offers an Activate action for an inactive product", () => {
  render(<AdminProductStatusToggle productName="Daily Omega" isActive={false} onToggle={vi.fn()} />);

  const button = screen.getByRole("button", { name: "Activate Daily Omega" });
  expect(button.textContent).toContain("Activate");
  expect(button.getAttribute("aria-pressed")).toBe("false");
});
