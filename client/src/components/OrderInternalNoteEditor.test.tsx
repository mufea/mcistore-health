// @vitest-environment jsdom
import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import OrderInternalNoteEditor from "./OrderInternalNoteEditor";

function EditorHarness({ onSave }: { onSave: () => void }) {
  const [value, setValue] = useState("");
  return <OrderInternalNoteEditor value={value} onChange={setValue} onSave={onSave} />;
}

it("captures and saves an internal admin-only order note", () => {
  const onSave = vi.fn();
  render(<EditorHarness onSave={onSave} />);
  const input = screen.getByRole("textbox", { name: "Internal admin note" }) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: "Use insulated packaging" } });
  expect(input.value).toBe("Use insulated packaging");
  fireEvent.click(screen.getByRole("button", { name: "Save internal note" }));
  expect(onSave).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Only administrators can view this note. It is never shown to customers.")).toBeTruthy();
});
