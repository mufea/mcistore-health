// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import BrandMark, { MCI_BRAND_MARK_URL } from "./BrandMark";

it("renders the reusable MCI brand mark asset with descriptive alt text", () => {
  const { container } = render(<BrandMark size="lg" />);
  const image = container.querySelector("img");
  expect(image?.getAttribute("src")).toBe(MCI_BRAND_MARK_URL);
  expect(image?.getAttribute("alt")).toBe("MCI One More logo");
  expect(image?.getAttribute("aria-hidden")).toBeNull();
});

it("forwards motion-safe hover classes for interactive brand placements", () => {
  const hoverClass = "motion-safe:group-hover:scale-[1.06] motion-safe:group-hover:-translate-y-0.5";
  const { container } = render(<BrandMark className={hoverClass} />);

  expect(container.firstElementChild?.className).toContain("motion-safe:group-hover:scale-[1.06]");
  expect(container.firstElementChild?.className).toContain("motion-safe:group-hover:-translate-y-0.5");
});
