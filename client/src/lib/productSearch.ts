export function buildCatalogSearchPath(query: string) {
  const term = query.trim();
  return term ? `/products?search=${encodeURIComponent(term)}` : "/products";
}

export function getCatalogSearchTerm(search: string) {
  return new URLSearchParams(search).get("search")?.trim() ?? "";
}

export function getCatalogCategory(search: string) {
  return new URLSearchParams(search).get("category")?.trim() || "all";
}
