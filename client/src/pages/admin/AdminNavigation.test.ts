import { describe, expect, it } from "vitest";
import { adminNavItems } from "./AdminDashboard";

describe("admin navigation", () => {
  it("exposes Homepage Content as a separate menu from general Settings", () => {
    expect(adminNavItems.find((item) => item.href === "/admin/homepage-content")?.label).toBe("Homepage Content");
    expect(adminNavItems.find((item) => item.href === "/admin/settings")?.label).toBe("Settings");
    expect(adminNavItems.findIndex((item) => item.href === "/admin/homepage-content")).toBeLessThan(adminNavItems.findIndex((item) => item.href === "/admin/settings"));
  });
});
