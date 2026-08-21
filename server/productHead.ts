import { buildProductCanonicalUrl, buildProductMetadata } from "../shared/productMetadata";
import { getProductById } from "./db";

export type ProductHeadMetadata = ReturnType<typeof buildProductMetadata> & { canonicalUrl: string };
export type ProductHeadLookup = typeof getProductById;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function getProductHeadMetadata(requestUrl: string, getProduct: ProductHeadLookup = getProductById): Promise<ProductHeadMetadata | null> {
  const pathname = requestUrl.split("?", 1)[0] ?? requestUrl;
  const match = pathname.match(/^\/products\/(\d+)$/);
  if (!match) return null;

  const product = await getProduct(Number(match[1]));
  if (!product || !product.isActive || !["all", "standard"].includes(product.targetSegment)) return null;
  return { ...buildProductMetadata(product), canonicalUrl: buildProductCanonicalUrl(product.id) };
}

export function injectProductHeadMetadata(template: string, metadata: ProductHeadMetadata) {
  const title = `<title>${escapeHtml(metadata.title)}</title>`;
  const description = `<meta name="description" content="${escapeHtml(metadata.description)}" />`;
  const canonical = `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`;
  const withCoreMetadata = template
    .replace(/<title>[\s\S]*?<\/title>/i, title)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, description);
  return /<link\s+rel=["']canonical["'][^>]*>/i.test(withCoreMetadata)
    ? withCoreMetadata.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
    : withCoreMetadata.replace(/<\/head>/i, `  ${canonical}\n  </head>`);
}

export async function renderHtmlWithProductHead(template: string, requestUrl: string, getProduct?: ProductHeadLookup) {
  const metadata = await getProductHeadMetadata(requestUrl, getProduct);
  return metadata ? injectProductHeadMetadata(template, metadata) : template;
}
