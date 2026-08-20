import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Check, Loader2, Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import ProductImageGallery from "@/components/ProductImageGallery";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";

function getStoredCart(): number[] {
  try {
    const stored = sessionStorage.getItem("pending_cart");
    const value = stored ? JSON.parse(stored) : [];
    return Array.isArray(value) ? value.filter((item): item is number => Number.isInteger(item)) : [];
  } catch {
    return [];
  }
}

function getStoredQuantities(): Record<number, number> {
  try {
    const stored = sessionStorage.getItem("pending_quantities");
    const value = stored ? JSON.parse(stored) : {};
    return Object.entries(value).reduce<Record<number, number>>((result, [id, quantity]) => {
      const productId = Number(id);
      const amount = Number(quantity);
      if (Number.isInteger(productId) && Number.isInteger(amount) && amount > 0) result[productId] = amount;
      return result;
    }, {});
  } catch {
    return {};
  }
}

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const detail = translations.productDetail;
  const productId = Number(params.id);
  const [quantity, setQuantity] = useState(1);
  const segment = isAuthenticated ? (user?.segment ?? "standard") : "standard";

  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: Number.isInteger(productId) && productId > 0 }
  );
  const { data: relatedProducts } = trpc.products.list.useQuery({ segment });

  const stock = product?.stock ?? 0;
  const inStock = stock > 0;
  const related = (relatedProducts ?? [])
    .filter((item) => item.id !== product?.id && (item.category === product?.category || item.isFeatured))
    .slice(0, 4);

  const requestSignIn = () => {
    sessionStorage.setItem("pending_checkout_after_login", "true");
    window.location.href = getLoginUrl();
  };

  const persistProductSelection = () => {
    if (!product) return;
    const cart = getStoredCart();
    if (!cart.includes(product.id)) {
      sessionStorage.setItem("pending_cart", JSON.stringify([...cart, product.id]));
    }
    const quantities = getStoredQuantities();
    sessionStorage.setItem("pending_quantities", JSON.stringify({ ...quantities, [product.id]: quantity }));
  };

  const addToCart = () => {
    if (!product) return;
    persistProductSelection();
    if (!isAuthenticated) {
      requestSignIn();
      return;
    }
    toast.success(t(detail.addedToCart, lang));
  };

  const buyNow = () => {
    if (!product) return;
    persistProductSelection();
    if (!isAuthenticated) {
      requestSignIn();
      return;
    }
    navigate(`/checkout?products=${product.id}&segment=${segment}&quantities=${encodeURIComponent(`${product.id}:${quantity}`)}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">{t(detail.notFound, lang)}</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{t(detail.notFoundDesc, lang)}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">{t(detail.backToProducts, lang)}</Link>
          </Button>
          <BackToHome />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="py-8 sm:py-12">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
              <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" />{t(detail.backToProducts, lang)}</Link>
            </Button>
            <BackToHome />
          </div>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <ProductImageGallery
              imageUrl={product.imageUrl}
              images={product.images ?? null}
              productName={product.name}
              mode="detail"
              className="w-full"
            />

            <div className="flex flex-col items-start">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-medium">{product.category}</Badge>
                {product.isFeatured && <Badge className="border-0 bg-amber-500 text-white"><Sparkles className="mr-1 h-3 w-3" />{t(detail.featured, lang)}</Badge>}
                {product.targetSegment !== "all" && <Badge className="border-0 bg-primary text-primary-foreground">{t(detail.exclusive, lang)} · {product.targetSegment}</Badge>}
              </div>

              <h1 className="font-serif text-3xl font-light leading-tight text-foreground sm:text-4xl">{product.name}</h1>
              <p className="mt-4 text-3xl font-semibold text-primary">IDR {Number(product.price).toLocaleString("id-ID")}</p>

              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className={inStock ? "font-medium text-emerald-700" : "font-medium text-red-700"}>
                  {inStock ? t(detail.inStock, lang) : t(detail.outOfStock, lang)}
                </span>
                {inStock && <span className="text-muted-foreground">· {stock} {t(detail.stock, lang)}</span>}
              </div>

              <div className="my-6 h-px w-full bg-border/70" />
              <div className="w-full">
                <h2 className="font-semibold text-foreground">{t(detail.productDetails, lang)}</h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{product.description || "—"}</p>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="mt-6 w-full">
                  <p className="mb-2 text-sm font-medium text-foreground">{t(detail.tags, lang)}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>)}
                  </div>
                </div>
              )}

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex h-11 items-center justify-between rounded-lg border border-border bg-background p-1 sm:w-32">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!inStock || quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-6 text-center text-sm font-semibold" aria-label={`${t(detail.quantity, lang)}: ${quantity}`}>{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!inStock || quantity >= stock} onClick={() => setQuantity((value) => Math.min(stock, value + 1))} aria-label="Increase quantity">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="h-11 flex-1" variant="outline" onClick={addToCart} disabled={!inStock}>
                  <ShoppingBag className="mr-2 h-4 w-4" />{isAuthenticated ? t(detail.addToCart, lang) : t(detail.signInToAdd, lang)}
                </Button>
                <Button className="h-11 flex-1 bg-primary text-primary-foreground" onClick={buyNow} disabled={!inStock}>
                  <Check className="mr-2 h-4 w-4" />{t(detail.buyNow, lang)}
                </Button>
              </div>
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border/60 pt-10">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="gold-line mb-3" />
                  <h2 className="font-serif text-3xl font-light text-foreground">{t(detail.relatedProducts, lang)}</h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-primary">
                  <Link href="/products">{t(detail.viewAll, lang)}<ArrowLeft className="ml-2 h-4 w-4 rotate-180" /></Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((item) => (
                  <Link key={item.id} href={`/products/${item.id}`}>
                    <article className="group overflow-hidden rounded-xl border border-border/60 bg-card transition-shadow hover:shadow-md">
                      <ProductImageGallery imageUrl={item.imageUrl} images={item.images ?? null} productName={item.name} mode="card" className="aspect-square" />
                      <div className="p-3">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="mt-1 text-sm font-semibold text-primary">IDR {Number(item.price).toLocaleString("id-ID")}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
