export type ProductBreadcrumbItem = {
  label: string;
  href?: string;
};

export function buildProductBreadcrumbItems(homeLabel: string, productsLabel: string, currentLabel?: string): ProductBreadcrumbItem[] {
  const items: ProductBreadcrumbItem[] = [
    { label: homeLabel, href: "/" },
    { label: productsLabel, href: currentLabel ? "/products" : undefined },
  ];
  if (currentLabel) items.push({ label: currentLabel });
  return items;
}
