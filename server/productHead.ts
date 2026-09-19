import { buildProductCanonicalUrl, buildProductMetadata } from "../shared/productMetadata";
import { buildProductJsonLd, serializeProductJsonLd } from "../shared/productSchema";
import { getProductById, getProductBySlug } from "./db";

export type ProductHeadMetadata = ReturnType<typeof buildProductMetadata> & {
  canonicalUrl: string;
  productSchema: ReturnType<typeof buildProductJsonLd>;
};
export type ProductHeadLookup = (key: string | number) => Promise<any | undefined>;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function getProductHeadMetadata(requestUrl: string, getProduct?: ProductHeadLookup): Promise<ProductHeadMetadata | null> {
  const pathname = requestUrl.split("?", 1)[0] ?? requestUrl;
  const idMatch = pathname.match(/^\/products\/(\d+)$/);
  const slugMatch = idMatch ? null : pathname.match(/^\/products\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (!idMatch && !slugMatch) return null;

  const lookupKey = slugMatch ? slugMatch[1] : Number(idMatch![1]);
  const product = getProduct
    ? await getProduct(lookupKey)
    : slugMatch
      ? await getProductBySlug(lookupKey as string)
      : await getProductById(lookupKey as number);
  if (!product || !product.isActive || !["all", "standard"].includes(product.targetSegment)) return null;
  const canonicalValue = product.slug || lookupKey;
  return {
    ...buildProductMetadata(product),
    canonicalUrl: buildProductCanonicalUrl(canonicalValue),
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
