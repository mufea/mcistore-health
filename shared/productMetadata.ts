const SITE_NAME = "MCI Store";
const CANONICAL_ORIGIN = "https://mci-store.com";
const MAX_DESCRIPTION_LENGTH = 160;

export type ProductMetadataSource = {
  id?: number;
  slug?: string | null;
  name: string;
  description?: string | null;
  category?: string | null;
};

function truncateDescription(value: string) {
  if (value.length <= MAX_DESCRIPTION_LENGTH) return value;
  return `${value.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

export function buildProductMetadata(product: ProductMetadataSource) {
  const fallbackDescription = `${product.name} is a health and wellness product from ${SITE_NAME}${product.category ? ` in the ${product.category} category` : ""}.`;
  const description = truncateDescription((product.description?.replace(/\s+/g, " ").trim() || fallbackDescription));
  return {
    title: `${product.name} | ${SITE_NAME}`,
    description,
  };
}

export function buildProductCanonicalUrl(slugOrId: string | number) {
  return `${CANONICAL_ORIGIN}/products/${encodeURIComponent(String(slugOrId))}`;
}
