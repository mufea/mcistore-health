// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import BrandMark, { MCI_BRAND_MARK_URL } from "./BrandMark";

it("renders the reusable MCI brand mark asset decoratively", () => {
  const { container } = render(<BrandMark size="lg" />);
  const image = container.querySelector("img");
  expect(image?.getAttribute("src")).toBe(MCI_BRAND_MARK_URL);
  expect(image?.getAttribute("alt")).toBe("");
  expect(image?.getAttribute("aria-hidden")).toBe("true");
});
