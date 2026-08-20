const SITE_URL = "https://mci-store.com";

type SitemapProduct = { id: number; updatedAt: Date };

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    "\"": "&quot;",
  })[character] ?? character);
}

function sitemapUrl(loc: string, lastmod: string, changefreq: "daily" | "weekly" | "monthly", priority: string) {
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export function buildSitemapXml(products: SitemapProduct[], generatedAt = new Date()) {
  const currentDate = generatedAt.toISOString().slice(0, 10);
  const staticUrls = [
    sitemapUrl(`${SITE_URL}/`, currentDate, "weekly", "1.0"),
    sitemapUrl(`${SITE_URL}/products`, currentDate, "daily", "0.9"),
    sitemapUrl(`${SITE_URL}/survey`, currentDate, "monthly", "0.8"),
  ];
  const productUrls = products.map((product) => sitemapUrl(
    `${SITE_URL}/products/${product.id}`,
    product.updatedAt.toISOString().slice(0, 10),
    "weekly",
    "0.8"
  ));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...productUrls].join("\n")}\n</urlset>\n`;
}
