// @vitest-environment jsdom
import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import CheckoutItemNoteInput from "./CheckoutItemNoteInput";

function NoteHarness() {
  const [value, setValue] = useState("");
  return <CheckoutItemNoteInput itemName="Daily Omega" label="Special instructions" placeholder="Add instructions" value={value} onChange={setValue} />;
}

it("captures an item-specific special instruction and limits it to 500 characters", () => {
  render(<NoteHarness />);
  const input = screen.getByRole("textbox", { name: "Special instructions: Daily Omega" });
  fireEvent.change(input, { target: { value: "Pack separately" } });
  expect((input as HTMLTextAreaElement).value).toBe("Pack separately");

  fireEvent.change(input, { target: { value: "x".repeat(520) } });
  expect((input as HTMLTextAreaElement).value).toBe("x".repeat(500));
});
