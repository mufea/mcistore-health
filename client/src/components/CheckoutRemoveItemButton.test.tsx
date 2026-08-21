// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import CheckoutRemoveItemButton from "./CheckoutRemoveItemButton";

it("requires confirmation before calling the supplied Checkout removal action", async () => {
  const user = userEvent.setup();
  const onRemove = vi.fn();
  render(
    <CheckoutRemoveItemButton
      itemName="Daily Omega"
      label="Remove item"
      confirmTitle="Remove this item?"
      confirmDescription="Daily Omega will be removed from checkout."
      cancelLabel="Cancel"
      confirmLabel="Remove item"
      onRemove={onRemove}
    />,
  );

  await user.click(screen.getByRole("button", { name: "Remove item: Daily Omega" }));
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(onRemove).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onRemove).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Remove item: Daily Omega" }));
  await user.click(screen.getByRole("button", { name: "Remove item" }));

  expect(onRemove).toHaveBeenCalledOnce();
});
