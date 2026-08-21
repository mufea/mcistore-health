import { buildProductCanonicalUrl, buildProductMetadata } from "../shared/productMetadata";
import { buildProductJsonLd, serializeProductJsonLd } from "../shared/productSchema";
import { getProductById } from "./db";

export type ProductHeadMetadata = ReturnType<typeof buildProductMetadata> & {
  canonicalUrl: string;
  productSchema: ReturnType<typeof buildProductJsonLd>;
};
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
  return {
    ...buildProductMetadata(product),
    canonicalUrl: buildProductCanonicalUrl(product.id),
    productSchema: buildProductJsonLd(product),
  };
}

export function injectProductHeadMetadata(template: string, metadata: ProductHeadMetadata) {
  const title = `<title>${escapeHtml(metadata.title)}</title>`;
  const description = `<meta name="description" content="${escapeHtml(metadata.description)}" />`;
  const canonical = `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`;
  const schema = `<script type="application/ld+json" data-product-schema="true">${serializeProductJsonLd(metadata.productSchema)}</script>`;
  const withCoreMetadata = template
    .replace(/<title>[\s\S]*?<\/title>/i, title)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, description);
  const withCanonical = /<link\s+rel=["']canonical["'][^>]*>/i.test(withCoreMetadata)
    ? withCoreMetadata.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
    : withCoreMetadata.replace(/<\/head>/i, `  ${canonical}\n  </head>`);
  return /<script\s+type=["']application\/ld\+json["'][^>]*data-product-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i.test(withCanonical)
    ? withCanonical.replace(/<script\s+type=["']application\/ld\+json["'][^>]*data-product-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i, schema)
    : withCanonical.replace(/<\/head>/i, `  ${schema}\n  </head>`);
}

export async function renderHtmlWithProductHead(template: string, requestUrl: string, getProduct?: ProductHeadLookup) {
  const metadata = await getProductHeadMetadata(requestUrl, getProduct);
  return metadata ? injectProductHeadMetadata(template, metadata) : template;
}
