import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { buildProductBreadcrumbItems } from "@/lib/productBreadcrumb";

type ProductBreadcrumbProps = {
  homeLabel: string;
  productsLabel: string;
  currentLabel?: string;
  className?: string;
};

export default function ProductBreadcrumb({ homeLabel, productsLabel, currentLabel, className = "" }: ProductBreadcrumbProps) {
  const items = buildProductBreadcrumbItems(homeLabel, productsLabel, currentLabel);

  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-muted-foreground ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              {item.href ? (
                <Link href={item.href} itemProp="item" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span itemProp="name" aria-current={isCurrent ? "page" : undefined} className={isCurrent ? "font-medium text-foreground" : undefined}>
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
