import React from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
import { executeSuggestionCartAction } from "@/lib/homeSuggestionCart";
import type { SuggestibleProduct } from "@/lib/productSuggestions";

type SuggestionAddToCartButtonProps = {
  product: SuggestibleProduct;
  isAuthenticated: boolean;
  onAdded: () => void;
  onRequireSignIn: () => void;
};

export default function SuggestionAddToCartButton({ product, isAuthenticated, onAdded, onRequireSignIn }: SuggestionAddToCartButtonProps) {
  const { lang } = useLanguage();
  const detail = translations.productDetail;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    executeSuggestionCartAction({
      storage: sessionStorage,
      productId: product.id,
      stock: product.stock,
      isAuthenticated,
      callbacks: {
        onUnavailable: (reason) => {
          toast.error(reason === "out_of_stock" ? t(translations.productsPage.outOfStock, lang) : t(translations.nav.stockLimitReached, lang).replace("{stock}", String(product.stock)));
        },
        onAdded: () => {
          toast.success(t(detail.addedToCart, lang));
          onAdded();
        },
        onRequireSignIn,
      },
    });
  };

  return (
    <span className="flex shrink-0 flex-col items-end gap-0.5">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-8 w-8 bg-background/80"
        disabled={isOutOfStock}
        aria-label={`${t(detail.addToCart, lang)}: ${product.name}`}
        title={isOutOfStock ? t(translations.productsPage.outOfStock, lang) : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="h-3.5 w-3.5" />
      </Button>
      {isOutOfStock && <span className="text-[10px] font-medium leading-none text-destructive">{t(translations.productsPage.outOfStock, lang)}</span>}
    </span>
  );
}
