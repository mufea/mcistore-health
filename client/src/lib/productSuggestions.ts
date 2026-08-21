export type SuggestibleProduct = {
  id: number;
  name: string;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  images?: Array<{ url: string }> | null;
};

export function getProductSuggestionImage(product: SuggestibleProduct) {
  return product.images?.find((image) => Boolean(image.url))?.url || product.imageUrl || null;
}

export function getProductSuggestions<T extends SuggestibleProduct>(products: T[], query: string, limit = 5): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (normalizedQuery.length < 2) return [];

  return products
    .map((product) => {
      const name = product.name.toLocaleLowerCase();
      const category = product.category.toLocaleLowerCase();
      const description = product.description?.toLocaleLowerCase() ?? "";
      const score = name.includes(normalizedQuery) ? 0 : category.includes(normalizedQuery) ? 1 : description.includes(normalizedQuery) ? 2 : -1;
      return { product, score };
    })
    .filter((result) => result.score >= 0)
    .sort((a, b) => a.score - b.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((result) => result.product);
}
