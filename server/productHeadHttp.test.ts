import express from "express";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createHtmlFallbackHandler } from "./_core/vite";

const servers: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  })));
});

describe("product-detail HTTP metadata", () => {
  it("returns product-specific title and description in raw HTML before hydration", async () => {
    const app = express();
    const applicationTemplate = resolve(process.cwd(), "client/index.html");
    app.use("*", createHtmlFallbackHandler(
      applicationTemplate,
      async (id) => ({
          id,
          name: "Cardio Care Plus",
          description: "Targeted nutritional support for daily cardiovascular wellness.",
          category: "Supplement",
          isActive: true,
          targetSegment: "all",
        } as any)
    ));

    const server = createServer(app);
    servers.push(server);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;

    const response = await fetch(`http://127.0.0.1:${port}/products/77`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("<title>Cardio Care Plus | MCI One More</title>");
    expect(html).toContain('content="Targeted nutritional support for daily cardiovascular wellness."');
    expect(html).toContain('<link rel="canonical" href="https://mci-store.com/products/77" />');
    expect(html).toContain('data-product-schema="true"');
    expect(html).not.toContain("Trusted Health Partner");
  });
});
