// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import AdminProductEditButton from "./AdminProductEditButton";

it("renders a labeled Edit button and opens the product editor when clicked", () => {
  const onEdit = vi.fn();

  render(<AdminProductEditButton productName="Daily Omega" onEdit={onEdit} />);

  const button = screen.getByRole("button", { name: "Edit Daily Omega" });
  expect(button.textContent).toContain("Edit");
  expect(button.getAttribute("title")).toBe("Edit Daily Omega");

  fireEvent.click(button);
  expect(onEdit).toHaveBeenCalledTimes(1);
});
