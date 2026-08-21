// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import CheckoutRemoveItemButton from "./CheckoutRemoveItemButton";

it("calls the supplied Checkout removal action when the accessible control is clicked", async () => {
  const user = userEvent.setup();
  const onRemove = vi.fn();
  render(<CheckoutRemoveItemButton itemName="Daily Omega" label="Remove item" onRemove={onRemove} />);

  await user.click(screen.getByRole("button", { name: "Remove item: Daily Omega" }));

  expect(onRemove).toHaveBeenCalledOnce();
});
