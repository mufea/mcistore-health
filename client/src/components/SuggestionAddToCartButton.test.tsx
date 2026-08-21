// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SuggestionAddToCartButton from "./SuggestionAddToCartButton";

const { toastError, toastSuccess } = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { error: toastError, success: toastSuccess } }));
vi.mock("@/contexts/LanguageContext", () => ({ useLanguage: () => ({ lang: "en" }) }));

const product = { id: 7, name: "Daily Omega", category: "Supplement", price: "250000", stock: 2 };

describe("SuggestionAddToCartButton", () => {
  afterEach(cleanup);

  beforeEach(() => {
    sessionStorage.clear();
    toastError.mockClear();
    toastSuccess.mockClear();
  });

  it("persists an authenticated button click and shows the translated success feedback", async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    render(<SuggestionAddToCartButton product={product} isAuthenticated onAdded={onAdded} onRequireSignIn={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add to Cart: Daily Omega" }));

    expect(sessionStorage.getItem("pending_cart")).toBe("[7]");
    expect(sessionStorage.getItem("pending_quantities")).toBe('{"7":1}');
    expect(onAdded).toHaveBeenCalledOnce();
    expect(toastSuccess).toHaveBeenCalledWith("Added to cart!");
  });

  it("persists before triggering the unauthenticated sign-in callback", async () => {
    const user = userEvent.setup();
    const onRequireSignIn = vi.fn();
    render(<SuggestionAddToCartButton product={product} isAuthenticated={false} onAdded={vi.fn()} onRequireSignIn={onRequireSignIn} />);

    await user.click(screen.getByRole("button", { name: "Add to Cart: Daily Omega" }));

    expect(sessionStorage.getItem("pending_cart")).toBe("[7]");
    expect(sessionStorage.getItem("pending_checkout_after_login")).toBe("true");
    expect(onRequireSignIn).toHaveBeenCalledOnce();
  });

  it("shows translated stock feedback without corrupting persisted cart state", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("pending_cart", "[7]");
    sessionStorage.setItem("pending_quantities", '{"7":2}');
    render(<SuggestionAddToCartButton product={product} isAuthenticated onAdded={vi.fn()} onRequireSignIn={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Add to Cart: Daily Omega" }));

    expect(sessionStorage.getItem("pending_quantities")).toBe('{"7":2}');
    expect(toastError).toHaveBeenCalledWith("Only 2 item(s) are available in stock.");
  });

  it("explains a disabled out-of-stock action and leaves persisted cart state unchanged", async () => {
    const user = userEvent.setup();
    const unavailableProduct = { ...product, stock: 0 };
    sessionStorage.setItem("pending_cart", "[7]");
    sessionStorage.setItem("pending_quantities", '{"7":1}');
    render(<SuggestionAddToCartButton product={unavailableProduct} isAuthenticated onAdded={vi.fn()} onRequireSignIn={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Add to Cart: Daily Omega" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Out of Stock")).toBeTruthy();
    await user.click(button);
    expect(sessionStorage.getItem("pending_cart")).toBe("[7]");
    expect(toastError).not.toHaveBeenCalled();
  });
});
