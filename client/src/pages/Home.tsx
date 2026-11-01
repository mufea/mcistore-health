import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Heart, ImageOff, Leaf, Pause, Play, Search, Shield, Sparkles, Star, ZoomIn } from "lucide-react";
import { Link, useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations, type Language } from "@/lib/i18n";
import { buildProductPath } from "@shared/slug";
import { buildOrganizationJsonLd, serializeOrganizationJsonLd } from "@/lib/organizationSchema";
import { buildCatalogSearchPath } from "@/lib/productSearch";
import { formatSuggestionPrice, getProductSuggestionImage, getProductSuggestions, type SuggestibleProduct } from "@/lib/productSuggestions";
import { getSuggestionState } from "@/lib/homeSuggestions";
import { buildWebsiteJsonLd, serializeWebsiteJsonLd } from "@/lib/websiteSchema";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import SuggestionAddToCartButton from "@/components/SuggestionAddToCartButton";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type TransdermalGalleryImage = { src: string; alt: Record<Language, string> };

const promotionSlides = [
  ["1000672755-full_d1cbf96b.webp", "1000672755-480w_ef04786f.webp"],
  ["1000672756-full_5d029cb6.webp", "1000672756-480w_5601f87f.webp"],
  ["1000672757-full_f8944d64.webp", "1000672757-480w_b810b9e7.webp"],
  ["1000672758-full_3d4f0299.webp", "1000672758-480w_7d724a81.webp"],
  ["1000672759-full_f75bb41f.webp", "1000672759-480w_0a3657dd.webp"],
  ["1000672760-full_61699dfe.webp", "1000672760-480w_03c2f8ce.webp"],
  ["1000672761-full_53511608.webp", "1000672761-480w_362a597b.webp"],
  ["1000672762-full_8f45646f.webp", "1000672762-480w_fa7b0d20.webp"],
  ["1000672763-full_70fc4506.webp", "1000672763-480w_8a3eef46.webp"],
  ["1000672764-full_a11b531e.webp", "1000672764-480w_8b732ad0.webp"],
].map(([full, mobile]) => ({
  full: `/manus-storage/${full}`,
  mobile: `/manus-storage/${mobile}`,
}));

/** Full-width inner wrapper — no max-width cap, generous horizontal padding */
function FullWide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 ${className}`}>
      {children}
    </div>
  );
}

function SuggestionThumbnail({ product }: { product: SuggestibleProduct }) {
  const imageUrl = getProductSuggestionImage(product);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageUrl]);

  if (!imageUrl || imageFailed) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground" aria-hidden="true">
        <ImageOff className="h-4 w-4" />
      </span>
    );
  }

  return <img src={imageUrl} alt={`${product.name} product thumbnail`} className="h-10 w-10 shrink-0 rounded-md border border-border/60 object-cover" onError={() => setImageFailed(true)} />;
}

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [productSearch, setProductSearch] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedTransdermalImage, setSelectedTransdermalImage] = useState<TransdermalGalleryImage | null>(null);
  const [promotionSlideIndex, setPromotionSlideIndex] = useState(0);
  const [promotionPaused, setPromotionPaused] = useState(false);
  const promotionSwipeStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const suppressPromotionClickRef = useRef(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const existingSchema = document.querySelector<HTMLScriptElement>('script[data-organization-schema="true"]');
    const previousSchema = existingSchema?.textContent;
    const schemaElement = existingSchema ?? document.createElement("script");
    const createdSchema = !existingSchema;

    if (createdSchema) {
      schemaElement.type = "application/ld+json";
      schemaElement.dataset.organizationSchema = "true";
      document.head.appendChild(schemaElement);
    }
    schemaElement.textContent = serializeOrganizationJsonLd(buildOrganizationJsonLd());

    return () => {
      if (createdSchema) schemaElement.remove();
      else schemaElement.textContent = previousSchema ?? "";
    };
  }, []);

  useEffect(() => {
    const existingSchema = document.querySelector<HTMLScriptElement>('script[data-website-schema="true"]');
    const previousSchema = existingSchema?.textContent;
    const schemaElement = existingSchema ?? document.createElement("script");
    const createdSchema = !existingSchema;

    if (createdSchema) {
      schemaElement.type = "application/ld+json";
      schemaElement.dataset.websiteSchema = "true";
      document.head.appendChild(schemaElement);
    }
    schemaElement.textContent = serializeWebsiteJsonLd(buildWebsiteJsonLd());

    return () => {
      if (createdSchema) schemaElement.remove();
      else schemaElement.textContent = previousSchema ?? "";
    };
  }, []);

  const { lang } = useLanguage();
  const { data: settings } = trpc.settings.getPublic.useQuery();
  const { data: featuredProducts, isLoading: productsLoading, isError: productsError } = trpc.products.list.useQuery({ segment: "standard" });

  const featured = (featuredProducts ?? []).filter((p) => p.isFeatured).slice(0, 4);
  const suggestions = getProductSuggestions(featuredProducts ?? [], productSearch);
  const showSuggestions = suggestionsOpen && productSearch.trim().length >= 2;
  const suggestionState = getSuggestionState({ query: productSearch, isLoading: productsLoading, isError: productsError, count: suggestions.length });

  useEffect(() => {
    if (!suggestionsOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [suggestionsOpen]);

  useEffect(() => {
    if (promotionPaused) return;
    const timer = window.setInterval(() => {
      setPromotionSlideIndex((index) => (index + 1) % promotionSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [promotionPaused]);

  const showPreviousPromotionSlide = () => {
    setPromotionSlideIndex((index) => (index - 1 + promotionSlides.length) % promotionSlides.length);
  };

  const showNextPromotionSlide = () => {
    setPromotionSlideIndex((index) => (index + 1) % promotionSlides.length);
  };

  const handlePromotionPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    promotionSwipeStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    setPromotionPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePromotionPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = promotionSwipeStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    promotionSwipeStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const isHorizontalSwipe = Math.abs(deltaX) >= 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    if (isHorizontalSwipe) {
      suppressPromotionClickRef.current = true;
      if (deltaX < 0) showNextPromotionSlide();
      else showPreviousPromotionSlide();
      window.setTimeout(() => { suppressPromotionClickRef.current = false; }, 0);
    }
    setPromotionPaused(false);
  };

  const handlePromotionImageClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressPromotionClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    setSelectedTransdermalImage({ src: promotionSlides[promotionSlideIndex].full, alt: translations.promotionHome.slideAlt });
  };

  const goToSuggestion = (slug: string) => {
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    navigate(buildProductPath(slug));
  };

  const features = [
    {
      icon: Heart,
      title: t(translations.features.f1Title, lang),
      description: t(translations.features.f1Desc, lang),
    },
    {
      icon: Leaf,
      title: t(translations.features.f2Title, lang),
      description: t(translations.features.f2Desc, lang),
    },
    {
      icon: Shield,
      title: t(translations.features.f3Title, lang),
      description: t(translations.features.f3Desc, lang),
    },
    {
      icon: Sparkles,
      title: t(translations.features.f4Title, lang),
      description: t(translations.features.f4Desc, lang),
    },
  ];

  const heroCardItems = [
    t(translations.hero.cardItem1, lang),
    t(translations.hero.cardItem2, lang),
    t(translations.hero.cardItem3, lang),
    t(translations.hero.cardItem4, lang),
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: t(translations.howItWorks.step1Title, lang),
      description: t(translations.howItWorks.step1Desc, lang),
    },
    {
      step: "02",
      title: t(translations.howItWorks.step2Title, lang),
      description: t(translations.howItWorks.step2Desc, lang),
    },
    {
      step: "03",
      title: t(translations.howItWorks.step3Title, lang),
      description: t(translations.howItWorks.step3Desc, lang),
    },
  ];

  const conversionBenefits = [
    {
      icon: Heart,
      title: t(translations.conversion.benefit1Title, lang),
      description: t(translations.conversion.benefit1Desc, lang),
    },
    {
      icon: Shield,
      title: t(translations.conversion.benefit2Title, lang),
      description: t(translations.conversion.benefit2Desc, lang),
    },
    {
      icon: CheckCircle,
      title: t(translations.conversion.benefit3Title, lang),
      description: t(translations.conversion.benefit3Desc, lang),
    },
  ];

  return (
    <MainLayout>
      {/* ── Hero ── full-width asymmetric layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background py-8 sm:py-10 flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.72_0.12_75/0.08),transparent_60%)]" />
        {/* decorative large circle */}
        <div className="absolute right-0 top-0 w-[55vw] h-[55vw] max-w-4xl max-h-4xl rounded-full bg-primary/5 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-[30vw] h-[30vw] max-w-xl max-h-xl rounded-full bg-primary/4 pointer-events-none" />

        <FullWide className="relative py-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
                {t(translations.hero.badge, lang)}
              </Badge>
              <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-light text-foreground leading-tight mb-6">
                {t(translations.hero.titleLine1, lang)}{" "}
                <span className="font-semibold text-primary italic">{t(translations.hero.titleHighlight, lang)}</span>{" "}
                {t(translations.hero.titleLine2, lang)}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
                {settings?.siteTagline ?? t(translations.hero.tagline, lang)}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                  <Link href="/survey">
                    {t(translations.hero.ctaSurvey, lang)}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 px-8">
                  <Link href="/products">{t(translations.hero.ctaProducts, lang)}</Link>
                </Button>
              </div>
              <form
                role="search"
                className="mt-5 flex max-w-xl gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                    goToSuggestion(suggestions[activeSuggestionIndex].slug);
                    return;
                  }
                  navigate(buildCatalogSearchPath(productSearch));
                }}
              >
                <label htmlFor="home-product-search" className="sr-only">{t(translations.hero.searchLabel, lang)}</label>
                <div
                  ref={searchContainerRef}
                  className="relative flex-1"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setSuggestionsOpen(false);
                      setActiveSuggestionIndex(-1);
                    }
                  }}
                >
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="home-product-search"
                    type="search"
                    value={productSearch}
                    onChange={(event) => {
                      setProductSearch(event.target.value);
                      setSuggestionsOpen(true);
                      setActiveSuggestionIndex(-1);
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSuggestionsOpen(false);
                        setActiveSuggestionIndex(-1);
                      } else if (suggestionState === "results" && event.key === "ArrowDown") {
                        event.preventDefault();
                        setActiveSuggestionIndex((index) => Math.min(index + 1, suggestions.length - 1));
                      } else if (suggestionState === "results" && event.key === "ArrowUp") {
                        event.preventDefault();
                        setActiveSuggestionIndex((index) => Math.max(index - 1, -1));
                      }
                    }}
                    placeholder={t(translations.hero.searchPlaceholder, lang)}
                    className="h-11 bg-background/90 pl-9 shadow-sm"
                    aria-autocomplete="list"
                    aria-expanded={showSuggestions}
                    aria-controls="home-product-suggestions"
                    aria-activedescendant={activeSuggestionIndex >= 0 ? `home-product-suggestion-${suggestions[activeSuggestionIndex]?.id}` : undefined}
                  />
                  {showSuggestions && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-border/70 bg-popover text-popover-foreground shadow-lg">
                      <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(translations.hero.suggestionsLabel, lang)}</p>
                      {suggestionState === "loading" ? (
                        <p role="status" className="px-3 py-3 text-sm text-muted-foreground">{t(translations.hero.suggestionsLoading, lang)}</p>
                      ) : suggestionState === "error" ? (
                        <p role="alert" className="px-3 py-3 text-sm text-muted-foreground">{t(translations.hero.suggestionsError, lang)}</p>
                      ) : suggestionState === "results" ? (
                        <ul id="home-product-suggestions" role="listbox" className="pb-1">
                          {suggestions.map((product, index) => (
                            <li key={product.id} id={`home-product-suggestion-${product.id}`} role="option" aria-selected={index === activeSuggestionIndex} className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${index === activeSuggestionIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/70"}`}>
                              <button
                                type="button"
                                className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left text-sm"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => goToSuggestion(product.slug)}
                              >
                                <SuggestionThumbnail product={product} />
                                <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
                                <span className="shrink-0 text-right">
                                  <span className="block text-xs text-muted-foreground">{product.category}</span>
                                  <span className="block text-xs font-semibold text-primary">{formatSuggestionPrice(product.price)}</span>
                                </span>
                              </button>
                              <SuggestionAddToCartButton
                                product={product}
                                isAuthenticated={isAuthenticated}
                                onAdded={() => {
                                  setSuggestionsOpen(false);
                                  setActiveSuggestionIndex(-1);
                                }}
                                onRequireSignIn={() => {
                                  setSuggestionsOpen(false);
                                  setActiveSuggestionIndex(-1);
                                  window.location.href = getLoginUrl();
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-3 py-3 text-sm text-muted-foreground">{t(translations.hero.noSuggestions, lang)}</p>
                      )}
                      <button
                        type="submit"
                        className="flex w-full border-t border-border/60 px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-accent/70"
                      >
                        {t(translations.hero.viewAllResults, lang)}
                      </button>
                    </div>
                  )}
                </div>
                <Button type="submit" variant="outline" className="h-11 shrink-0">
                  {t(translations.hero.searchButton, lang)}
                </Button>
              </form>
              <div className="mt-10 flex items-center gap-8">
                {[
                  { label: t(translations.hero.stat1Label, lang), value: "10,000+" },
                  { label: t(translations.hero.stat2Label, lang), value: "200+" },
                  { label: t(translations.hero.stat3Label, lang), value: "98%" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-serif text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: decorative card stack */}
            <div className="hidden lg:flex flex-col gap-4 items-end">
              <div className="w-full max-w-sm bg-card border border-border/60 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t(translations.hero.cardTitle, lang)}</p>
                    <p className="text-xs text-muted-foreground">{t(translations.hero.cardSub, lang)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {heroCardItems.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-xs bg-primary text-primary-foreground rounded-2xl p-5 shadow-lg">
                <p className="font-serif text-lg font-light mb-1">{t(translations.hero.scoreLabel, lang)}</p>
                <p className="font-serif text-4xl font-semibold">94<span className="text-xl font-light">/100</span></p>
                <p className="text-sm text-primary-foreground/70 mt-1">{t(translations.hero.scoreDesc, lang)}</p>
              </div>
              <div className="w-full max-w-sm bg-card border border-border/60 rounded-2xl p-5 shadow-md flex items-center gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[oklch(0.72_0.12_75)] text-[oklch(0.72_0.12_75)]" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">"Life-changing products!"</p>
              </div>
            </div>
          </div>
        </FullWide>
      </section>

      {/* ── Promotional opportunity carousel ── */}
      <section className="bg-[#071f24] py-16 text-white sm:py-20" aria-labelledby="promotion-carousel-title">
        <FullWide>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c6e36c]">{t(translations.promotionHome.eyebrow, lang)}</p>
            <h2 id="promotion-carousel-title" className="mt-4 font-serif text-3xl font-light leading-tight sm:text-5xl">{t(translations.promotionHome.title, lang)}</h2>
            <p className="mt-4 text-base leading-7 text-white/70">{t(translations.promotionHome.description, lang)}</p>
          </div>

          <div
            className="mx-auto mt-10 max-w-[34rem]"
            onMouseEnter={() => setPromotionPaused(true)}
            onMouseLeave={() => setPromotionPaused(false)}
            onFocus={() => setPromotionPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setPromotionPaused(false);
            }}
          >
            <div
              className="relative touch-pan-y select-none overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl"
              style={{ touchAction: "pan-y" }}
              onPointerDown={handlePromotionPointerDown}
              onPointerUp={handlePromotionPointerUp}
              onPointerCancel={() => { promotionSwipeStartRef.current = null; setPromotionPaused(false); }}
              role="region"
              aria-roledescription="carousel"
              aria-label={t(translations.promotionHome.title, lang)}
            >
              <div aria-live="polite" aria-atomic="true">
                <button
                  type="button"
                  className="block w-full cursor-zoom-in text-left"
                  onClick={handlePromotionImageClick}
                  aria-label={`${t(translations.transdermalHome.openImage, lang)} — ${t(translations.promotionHome.slideStatus, lang).replace("{current}", String(promotionSlideIndex + 1)).replace("{total}", String(promotionSlides.length))}`}
                >
                  <img
                    key={promotionSlideIndex}
                    src={promotionSlides[promotionSlideIndex].full}
                    srcSet={`${promotionSlides[promotionSlideIndex].mobile} 480w, ${promotionSlides[promotionSlideIndex].full} 911w`}
                    sizes="(max-width: 640px) calc(100vw - 2rem), 520px"
                    alt={`${t(translations.promotionHome.slideAlt, lang)} ${promotionSlideIndex + 1}`}
                    width="911"
                    height="1620"
                    loading={promotionSlideIndex === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="animate-fade-in aspect-[911/1620] w-full object-cover"
                  />
                </button>
              </div>
              <button type="button" onClick={showPreviousPromotionSlide} aria-label={t(translations.promotionHome.previous, lang)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#071f24]/80 p-2.5 text-white shadow-lg transition hover:bg-[#071f24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6e36c]">
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={showNextPromotionSlide} aria-label={t(translations.promotionHome.next, lang)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#071f24]/80 p-2.5 text-white shadow-lg transition hover:bg-[#071f24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6e36c]">
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#071f24]/85 px-3 py-2 shadow-lg">
                <span className="sr-only">{t(translations.promotionHome.slideStatus, lang).replace("{current}", String(promotionSlideIndex + 1)).replace("{total}", String(promotionSlides.length))}</span>
                {promotionSlides.map((_, index) => (
                  <button key={index} type="button" onClick={() => setPromotionSlideIndex(index)} aria-label={`${t(translations.promotionHome.slideStatus, lang).replace("{current}", String(index + 1)).replace("{total}", String(promotionSlides.length))}`} aria-current={index === promotionSlideIndex} className={`h-2 rounded-full transition-all ${index === promotionSlideIndex ? "w-6 bg-[#c6e36c]" : "w-2 bg-white/50 hover:bg-white"}`} />
                ))}
                <button type="button" onClick={() => setPromotionPaused((paused) => !paused)} aria-label={t(promotionPaused ? translations.promotionHome.play : translations.promotionHome.pause, lang)} className="ml-1 rounded-full p-1 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6e36c]">
                  {promotionPaused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>
        </FullWide>
      </section>

      {/* ── Features ── 4-column on desktop */}
      <section className="py-24 bg-background">
        <FullWide>
          <div className="text-center mb-16">
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-5xl font-light text-foreground mb-3">
              {t(translations.features.sectionTitle, lang)}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              {t(translations.features.sectionSub, lang)}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl border border-border/60 bg-card card-hover"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </FullWide>
      </section>

      {/* ── Transdermal Education ── */}
      <section className="overflow-hidden bg-[#eef7f7] py-20 sm:py-24">
        <FullWide>
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <div className="gold-line mb-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t(translations.transdermalHome.eyebrow, lang)}</p>
              <h2 className="mt-4 font-serif text-3xl font-light leading-tight text-foreground sm:text-5xl">{t(translations.transdermalHome.title, lang)}</h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">{t(translations.transdermalHome.description, lang)}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  [translations.transdermalHome.card1Title, translations.transdermalHome.card1Body],
                  [translations.transdermalHome.card2Title, translations.transdermalHome.card2Body],
                  [translations.transdermalHome.card3Title, translations.transdermalHome.card3Body],
                ].map(([title, description], index) => (
                  <div key={t(title, lang)} className="rounded-2xl border border-[#cfe3e3] bg-white/80 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-semibold text-primary">0{index + 1}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{t(title, lang)}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(description, lang)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-8 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/products?category=Transdermal%20Patch">{t(translations.transdermalHome.cta, lang)} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <figure className="group relative col-span-2 overflow-hidden rounded-3xl border border-[#cfe3e3] bg-white shadow-lg">
                <button type="button" className="block w-full cursor-zoom-in text-left" onClick={() => setSelectedTransdermalImage({ src: "/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-001-full_644f9941.webp", alt: translations.transdermalHome.image1Alt })} aria-label={t(translations.transdermalHome.openImage, lang)}>
                  <img src="/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-001-full_644f9941.webp" srcSet="/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-001-480w_d5973cbe.webp 480w, /manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-001-full_644f9941.webp 911w" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 55vw" alt={t(translations.transdermalHome.image1Alt, lang)} loading="lazy" decoding="async" className="h-auto max-h-[32rem] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                  <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-[#071f24]/85 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><ZoomIn className="h-4 w-4" />{t(translations.transdermalHome.openImage, lang)}</span>
                </button>
              </figure>
              <figure className="group relative overflow-hidden rounded-3xl border border-[#cfe3e3] bg-white shadow-md">
                <button type="button" className="block h-full w-full cursor-zoom-in text-left" onClick={() => setSelectedTransdermalImage({ src: "/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-002-full_e91f74d9.webp", alt: translations.transdermalHome.image2Alt })} aria-label={t(translations.transdermalHome.openImage, lang)}>
                  <img src="/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-002-full_e91f74d9.webp" srcSet="/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-002-480w_def7b291.webp 480w, /manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-002-full_e91f74d9.webp 911w" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 35vw, 28vw" alt={t(translations.transdermalHome.image2Alt, lang)} loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#071f24]/85 p-2 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><ZoomIn className="h-4 w-4" aria-hidden="true" /></span>
                </button>
              </figure>
              <figure className="group relative overflow-hidden rounded-3xl border border-[#cfe3e3] bg-white shadow-md">
                <button type="button" className="block h-full w-full cursor-zoom-in text-left" onClick={() => setSelectedTransdermalImage({ src: "/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-003-full_f5204d68.webp", alt: translations.transdermalHome.image3Alt })} aria-label={t(translations.transdermalHome.openImage, lang)}>
                  <img src="/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-003-full_f5204d68.webp" srcSet="/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-003-480w_a523af4b.webp 480w, /manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-003-full_f5204d68.webp 911w" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 35vw, 28vw" alt={t(translations.transdermalHome.image3Alt, lang)} loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                  <span className="absolute bottom-3 right-3 rounded-full bg-[#071f24]/85 p-2 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><ZoomIn className="h-4 w-4" aria-hidden="true" /></span>
                </button>
              </figure>
            </div>
          </div>
        </FullWide>
      </section>

      {/* ── Quality & Certifications ── */}
      <section className="bg-background py-20 sm:py-24">
        <FullWide>
          <div className="mx-auto max-w-3xl text-center">
            <div className="gold-line mx-auto mb-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t(translations.qualityHome.eyebrow, lang)}</p>
            <h2 className="mt-4 font-serif text-3xl font-light leading-tight text-foreground sm:text-5xl">{t(translations.qualityHome.title, lang)}</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">{t(translations.qualityHome.description, lang)}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                label: translations.qualityHome.card1,
                detail: translations.qualityHome.card1Detail,
                alt: translations.qualityHome.image1Alt,
                src: "/manus-storage/1000672753-full_fc1933da.webp",
                srcSet: "/manus-storage/1000672753-480w_be635796.webp 480w, /manus-storage/1000672753-full_fc1933da.webp 911w",
              },
              {
                label: translations.qualityHome.card2,
                detail: translations.qualityHome.card2Detail,
                alt: translations.qualityHome.image2Alt,
                src: "/manus-storage/1000672752-full_f0e8e555.webp",
                srcSet: "/manus-storage/1000672752-480w_f7eb7328.webp 480w, /manus-storage/1000672752-full_f0e8e555.webp 911w",
              },
              {
                label: translations.qualityHome.card3,
                detail: translations.qualityHome.card3Detail,
                alt: translations.qualityHome.image3Alt,
                src: "/manus-storage/1000672754-full_76127a46.webp",
                srcSet: "/manus-storage/1000672754-480w_d0c77436.webp 480w, /manus-storage/1000672754-full_76127a46.webp 911w",
              },
            ].map((image) => (
              <figure key={image.src} className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-lg">
                <button type="button" className="relative block w-full cursor-zoom-in text-left" onClick={() => setSelectedTransdermalImage({ src: image.src, alt: image.alt })} aria-label={t(translations.transdermalHome.openImage, lang)}>
                  <img src={image.src} srcSet={image.srcSet} sizes="(max-width: 767px) 100vw, 33vw" alt={t(image.alt, lang)} loading="lazy" decoding="async" className="aspect-[9/16] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                  <span className="absolute bottom-4 right-4 rounded-full bg-[#071f24]/85 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    {t(image.label, lang)}
                  </span>
                </button>
                <figcaption className="p-5 text-center">
                  <h3 className="font-semibold text-foreground">{t(image.label, lang)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(image.detail, lang)}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-muted-foreground">{t(translations.qualityHome.note, lang)}</p>
          <div className="mt-7 text-center">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/quality-certifications">{t(translations.qualityHome.pageCta, lang)} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </FullWide>
      </section>

      <Dialog open={Boolean(selectedTransdermalImage)} onOpenChange={(open) => !open && setSelectedTransdermalImage(null)}>
        <DialogContent className="max-w-5xl border-white/10 bg-[#071f24] p-3 text-white sm:p-5">
          <DialogTitle className="sr-only">{selectedTransdermalImage ? t(selectedTransdermalImage.alt, lang) : t(translations.transdermalHome.openImage, lang)}</DialogTitle>
          <DialogDescription className="sr-only">{t(translations.transdermalHome.openImage, lang)}</DialogDescription>
          {selectedTransdermalImage && (
            <img src={selectedTransdermalImage.src} alt={t(selectedTransdermalImage.alt, lang)} decoding="async" className="max-h-[82vh] w-full rounded-xl object-contain" />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="py-24 bg-muted/30">
          <FullWide>
            <div className="flex items-end justify-between mb-14">
              <div>
                <div className="gold-line mb-4" />
                <h2 className="font-serif text-3xl lg:text-5xl font-light text-foreground mb-2">
                  {t(translations.products.sectionTitle, lang)}
                </h2>
                <p className="text-muted-foreground text-base">{t(translations.products.sectionSub, lang)}</p>
              </div>
              <Button asChild variant="ghost" className="gap-2 hidden sm:flex">
                <Link href="/products">
                  {t(translations.products.viewAll, lang)} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <Link href={buildProductPath(product.slug)} key={product.id}>
                  <div className="group bg-card rounded-2xl border border-border/60 overflow-hidden card-hover cursor-pointer h-full">
                    <div className="relative aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Leaf className="h-8 w-8 text-primary/50" />
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute bottom-2 left-2 z-10">
                          <Badge className="border-0 bg-red-700 text-xs text-white shadow-sm" aria-label={t(translations.products.outOfStock, lang)}>
                            <AlertTriangle className="mr-1 h-3 w-3" aria-hidden="true" />
                            {t(translations.products.outOfStock, lang)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <Badge variant="secondary" className="text-xs mb-2">{product.category}</Badge>
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          IDR {Number(product.price).toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-primary font-medium">View →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </FullWide>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="py-24 bg-background">
        <FullWide>
          <div className="text-center mb-16">
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-5xl font-light text-foreground mb-3">
              {t(translations.howItWorks.sectionTitle, lang)}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              {t(translations.howItWorks.sectionSub, lang)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {howItWorksSteps.map((step, i) => (
              <div key={step.step} className="text-center relative">
                <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center mx-auto mb-5 bg-primary/5">
                  <span className="font-serif text-2xl font-semibold text-primary">{step.step}</span>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px bg-border/60" />
                )}
                <h3 className="font-semibold text-foreground mb-2 text-base">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-10">
              <Link href="/survey">
                {t(translations.howItWorks.beginJourney, lang)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </FullWide>
      </section>

      {/* ── Conversion Section ── */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border border-primary-foreground/15" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-primary-foreground/10" />
        <FullWide className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div>
              <Badge className="mb-5 border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-primary-foreground hover:bg-primary-foreground/15">
                {t(translations.conversion.eyebrow, lang)}
              </Badge>
              <h2 className="max-w-xl font-serif text-4xl font-light leading-tight sm:text-5xl">
                {t(translations.conversion.title, lang)}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg">
                {t(translations.conversion.description, lang)}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-background px-7 text-foreground shadow-lg hover:bg-background/90">
                  <Link href="/survey">
                    {t(translations.conversion.primaryCta, lang)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link href="/products">{t(translations.conversion.secondaryCta, lang)}</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-primary-foreground/60">
                {t(translations.conversion.reassurance, lang)}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {conversionBenefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-5 backdrop-blur-sm transition-colors hover:bg-primary-foreground/15">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/15">
                    <benefit.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-primary-foreground/70">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FullWide>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-background">
        <FullWide className="text-center">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="font-serif text-3xl lg:text-5xl font-light text-foreground mb-4">
            {t(translations.cta.title, lang)}
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed text-lg max-w-2xl mx-auto">
            {t(translations.cta.subtitle, lang)}
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-12">
            <Link href="/survey">
              {t(translations.cta.cta, lang)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </FullWide>
      </section>
    </MainLayout>
  );
}
