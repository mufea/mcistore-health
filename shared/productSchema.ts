import { buildProductCanonicalUrl } from "./productMetadata";

export type ProductSchemaSource = {
  id: number;
  name: string;
  description?: string | null;
  price: string | number;
  category: string;
  imageUrl?: string | null;
  images?: Array<{ url: string }> | null;
  stock: number;
};

export function buildProductJsonLd(product: ProductSchemaSource) {
  const images = [product.imageUrl, ...(product.images ?? []).map((image) => image.url)].filter(
    (url): url is string => Boolean(url)
  );
  const description = product.description?.replace(/\s+/g, " ").trim() || `${product.name} from MCI Store.`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    url: buildProductCanonicalUrl(product.id),
    ...(images.length > 0 ? { image: Array.from(new Set(images)) } : {}),
    category: product.category,
    offers: {
      "@type": "Offer",
      price: String(Number(product.price)),
      priceCurrency: "IDR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: buildProductCanonicalUrl(product.id),
    },
  };
}

export function serializeProductJsonLd(schema: ReturnType<typeof buildProductJsonLd>) {
  return JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
