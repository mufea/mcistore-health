export type AlternativeCandidate = {
  id: number;
  category: string;
  stock: number;
  isFeatured: boolean;
  tags?: string[] | null;
};

export function getInStockAlternatives<T extends AlternativeCandidate>(
  currentProduct: AlternativeCandidate,
  products: T[],
  limit = 4
) {
  return products
    .filter((item) => item.id !== currentProduct.id && item.stock > 0)
    .sort((a, b) => {
      const score = (item: AlternativeCandidate) =>
        (item.category === currentProduct.category ? 2 : 0) + (item.isFeatured ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, limit);
}

export function getAlternativeNeeds(products: AlternativeCandidate[]) {
  return [...new Set(products.flatMap((product) => product.tags ?? []))].sort((a, b) => a.localeCompare(b));
}

export function filterAlternativesByNeed<T extends AlternativeCandidate>(products: T[], need: string) {
  return need === "all" ? products : products.filter((product) => product.tags?.includes(need));
}
