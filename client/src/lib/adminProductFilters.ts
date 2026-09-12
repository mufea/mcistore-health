export type ProductStatusFilter = "all" | "active" | "inactive";

type FilterableAdminProduct = {
  name: string;
  category: string;
  isActive: boolean;
};

export function filterAdminProducts<T extends FilterableAdminProduct>(
  products: T[],
  search: string,
  status: ProductStatusFilter,
): T[] {
  const normalizedSearch = search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesSearch =
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.category.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      status === "all" || (status === "active" ? product.isActive : !product.isActive);

    return matchesSearch && matchesStatus;
  });
}
