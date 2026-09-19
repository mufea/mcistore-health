export const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidProductSlug(value: string) {
  return PRODUCT_SLUG_PATTERN.test(value);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

export function createProductSlug(name: string, id?: number) {
  const base = slugify(name);
  return base || `product${id ? `-${id}` : ""}`;
}

export function buildProductPath(slug: string) {
  return `/products/${encodeURIComponent(slug)}`;
}
