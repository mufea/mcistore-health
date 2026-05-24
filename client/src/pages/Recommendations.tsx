import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ArrowRight, Crown, Leaf, Loader2, Lock, ShoppingCart, Sparkles, Star } from "lucide-react";
import { useSearch, useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";

const segmentMeta = {
  standard: { color: "text-emerald-600", bg: "bg-emerald-50", icon: Leaf },
  premium:  { color: "text-amber-600",   bg: "bg-amber-50",   icon: Star },
  vip:      { color: "text-purple-600",  bg: "bg-purple-50",  icon: Crown },
};

export default function Recommendations() {
  const { lang } = useLanguage();
  const r = translations.recommendationsPage;
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const segment = (params.get("segment") as "standard" | "premium" | "vip") ?? "standard";
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<number[]>([]);

  const { data: products, isLoading } = trpc.products.list.useQuery({
    segment: isAuthenticated ? (user?.segment ?? segment) : segment,
  });

  const meta = segmentMeta[segment] ?? segmentMeta.standard;
  const Icon = meta.icon;
  const segmentLabel = segment === "vip" ? t(r.segmentVip, lang) : segment === "premium" ? t(r.segmentPremium, lang) : t(r.segmentStandard, lang);
  const segmentDesc  = segment === "vip" ? t(r.segmentVipDesc, lang) : segment === "premium" ? t(r.segmentPremiumDesc, lang) : t(r.segmentStandardDesc, lang);

  const toggleCart = (productId: number) => {
    setCart((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Store cart in session and redirect to login
      sessionStorage.setItem("pending_cart", JSON.stringify(cart));
      sessionStorage.setItem("pending_segment", segment);
      window.location.href = getLoginUrl();
      return;
    }
    // Navigate to checkout with selected products
    const productIds = cart.join(",");
    navigate(`/checkout?products=${productIds}&segment=${segment}`);
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

  return (
    <MainLayout>
      <div className="py-12">
        <div className="container">
          <BackToHome className="mb-8" />

          {/* Profile Banner */}
          <div className={`rounded-2xl border border-border/60 p-8 mb-10 ${meta.bg} animate-slide-up`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0">
                <Icon className={`h-6 w-6 ${meta.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {t(r.yourProfile, lang)}
                  </Badge>
                  <span className={`text-sm font-semibold ${meta.color}`}>{segmentLabel}</span>
                </div>
                <h1 className="font-serif text-2xl font-light text-foreground mb-1">
                  {t(r.personalizedTitle, lang)}
                </h1>
                <p className="text-muted-foreground text-sm">{segmentDesc}</p>
              </div>
            </div>
          </div>

          {/* Auth prompt */}
          {!isAuthenticated && (
            <div className="bg-card border border-primary/20 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t(r.signInPrompt, lang)}</p>
                  <p className="text-xs text-muted-foreground">{t(r.signInSub, lang)}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                {t(r.signIn, lang)}
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {!products || products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-light mb-2">{t(r.noProducts, lang)}</h3>
              <p className="text-muted-foreground text-sm">{t(r.noProductsSub, lang)}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-foreground">
                  {products.length} {products.length !== 1 ? t(r.productsCount, lang) : t(r.productCount1, lang)}
                </h2>
                {cart.length > 0 && (
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    onClick={handleCheckout}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t(r.checkout, lang)} ({cart.length})
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product, i) => {
                  const inCart = cart.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`group bg-card rounded-xl border overflow-hidden card-hover animate-slide-up transition-all ${
                        inCart ? "border-primary ring-1 ring-primary/30" : "border-border/60"
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {/* Image */}
                      <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden relative">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Leaf className="h-7 w-7 text-primary/40" />
                          </div>
                        )}
                        {product.targetSegment !== "all" && (
                          <div className="absolute top-2 right-2">
                            <Badge className="text-xs bg-amber-500 text-white border-0">
                              <Crown className="h-3 w-3 mr-1" />
                              {product.targetSegment}
                            </Badge>
                          </div>
                        )}
                        {product.isFeatured && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="text-xs">{t(r.featured, lang)}</Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <Badge variant="outline" className="text-xs mb-2">{product.category}</Badge>
                        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-foreground text-sm">
                            IDR {Number(product.price).toLocaleString("id-ID")}
                          </span>
                          {product.stock > 0 ? (
                            <span className="text-xs text-emerald-600 font-medium">{t(r.inStock, lang)}</span>
                          ) : (
                            <span className="text-xs text-destructive font-medium">{t(r.outOfStock, lang)}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className={`w-full gap-2 transition-all ${
                            inCart
                              ? "bg-primary text-primary-foreground"
                              : "variant-outline border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                          }`}
                          variant={inCart ? "default" : "outline"}
                          onClick={() => toggleCart(product.id)}
                          disabled={product.stock === 0}
                        >
                          {inCart ? (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" />
                              {t(r.addedToCart, lang)}
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" />
                              {t(r.addToCart, lang)}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky checkout bar */}
              {cart.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
                  <div className="bg-foreground text-background rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl">
                    <span className="text-sm font-medium">
                      {cart.length} {cart.length !== 1 ? t(r.itemsSelected, lang) : t(r.itemSelected, lang)}
                    </span>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full gap-2"
                      onClick={handleCheckout}
                    >
                      {t(r.proceedToCheckout, lang)}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
