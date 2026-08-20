import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Crown, Loader2, Search } from "lucide-react";
import ProductImageGallery from "@/components/ProductImageGallery";
import { useState } from "react";
import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
import { isLowStock, isOutOfStock, matchesStockFilter } from "@/lib/stock";

export default function Products() {
  const { lang } = useLanguage();
  const p = translations.productsPage;
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data: products, isLoading } = trpc.products.list.useQuery({
    segment: isAuthenticated ? (user?.segment ?? "standard") : "standard",
  });

  const categories = ["all", ...Array.from(new Set((products ?? []).map((p) => p.category)))];

  const filtered = (products ?? []).filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || p.category === category;
    return matchSearch && matchCategory && matchesStockFilter(p.stock, lowStockOnly);
  });

  return (
    <MainLayout>
      <div className="py-12">
        <div className="container">
          <BackToHome className="mb-8" />

          {/* Header */}
          <div className="mb-10">
            <div className="gold-line mb-4" />
            <h1 className="font-serif text-4xl font-light text-foreground mb-3">{t(p.title, lang)}</h1>
            <p className="text-muted-foreground max-w-lg">
              {t(p.subtitle, lang)}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t(p.searchPlaceholder, lang)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t(p.categoryPlaceholder, lang)} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? t(p.allCategories, lang) : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant={lowStockOnly ? "default" : "outline"}
              className="w-full sm:w-auto"
              onClick={() => setLowStockOnly((current) => !current)}
              aria-pressed={lowStockOnly}
            >
              <AlertTriangle className="mr-2 h-4 w-4" aria-hidden="true" />
              {t(p.lowStockOnly, lang)}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t(p.noProducts, lang)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product, i) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div
                    className="group bg-card rounded-xl border border-border/60 overflow-hidden card-hover cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="aspect-square relative">
                      <ProductImageGallery
                        imageUrl={product.imageUrl}
                        images={(product.images as { url: string; key: string }[] | null) ?? null}
                        productName={product.name}
                        mode="card"
                        className="w-full h-full"
                      />
                      {product.targetSegment !== "all" && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="text-xs bg-amber-500 text-white border-0">
                            <Crown className="h-3 w-3 mr-1" />
                            {product.targetSegment}
                          </Badge>
                        </div>
                      )}
                      {isOutOfStock(product.stock) && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <Badge className="border-0 bg-red-700 text-xs text-white shadow-sm" aria-label={t(p.outOfStock, lang)}>
                            <AlertTriangle className="mr-1 h-3 w-3" aria-hidden="true" />
                            {t(p.outOfStock, lang)}
                          </Badge>
                        </div>
                      )}
                      {isLowStock(product.stock) && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <Badge className="border-0 bg-red-600 text-xs text-white shadow-sm" aria-label={`${t(p.lowStock, lang)}: ${product.stock}`}>
                            <AlertTriangle className="mr-1 h-3 w-3" aria-hidden="true" />
                            {t(p.lowStock, lang)} · {product.stock}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <Badge variant="outline" className="text-xs mb-2">{product.category}</Badge>
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-sm">
                          IDR {Number(product.price).toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-primary font-medium">{t(p.viewProduct, lang)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
