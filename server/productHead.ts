import { buildProductMetadata } from "../shared/productMetadata";
import { getProductById } from "./db";

export type ProductHeadMetadata = ReturnType<typeof buildProductMetadata>;
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
  return buildProductMetadata(product);
}

export function injectProductHeadMetadata(template: string, metadata: ProductHeadMetadata) {
  const title = `<title>${escapeHtml(metadata.title)}</title>`;
  const description = `<meta name="description" content="${escapeHtml(metadata.description)}" />`;
  return template
    .replace(/<title>[\s\S]*?<\/title>/i, title)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, description);
}

export async function renderHtmlWithProductHead(template: string, requestUrl: string, getProduct?: ProductHeadLookup) {
  const metadata = await getProductHeadMetadata(requestUrl, getProduct);
  return metadata ? injectProductHeadMetadata(template, metadata) : template;
}
