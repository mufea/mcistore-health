import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, CheckCircle, Heart, ImageOff, Leaf, Search, Shield, Sparkles, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
import { buildOrganizationJsonLd, serializeOrganizationJsonLd } from "@/lib/organizationSchema";
import { buildCatalogSearchPath } from "@/lib/productSearch";
import { formatSuggestionPrice, getProductSuggestionImage, getProductSuggestions, type SuggestibleProduct } from "@/lib/productSuggestions";
import { getSuggestionState } from "@/lib/homeSuggestions";
import { buildWebsiteJsonLd, serializeWebsiteJsonLd } from "@/lib/websiteSchema";
import { useEffect, useRef, useState } from "react";

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

  return <img src={imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-md border border-border/60 object-cover" onError={() => setImageFailed(true)} />;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [productSearch, setProductSearch] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
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

  const goToSuggestion = (productId: number) => {
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    navigate(`/products/${productId}`);
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

  const testimonials = [
    {
      name: "Sarah M.",
      role: t(translations.testimonials.t1Role, lang),
      text: t(translations.testimonials.t1Text, lang),
      rating: 5,
    },
    {
      name: "David L.",
      role: t(translations.testimonials.t2Role, lang),
      text: t(translations.testimonials.t2Text, lang),
      rating: 5,
    },
    {
      name: "Priya K.",
      role: t(translations.testimonials.t3Role, lang),
      text: t(translations.testimonials.t3Text, lang),
      rating: 5,
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
                    goToSuggestion(suggestions[activeSuggestionIndex].id);
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
                            <li key={product.id} id={`home-product-suggestion-${product.id}`} role="option" aria-selected={index === activeSuggestionIndex}>
                              <button
                                type="button"
                                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${index === activeSuggestionIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/70"}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => goToSuggestion(product.id)}
                              >
                                <SuggestionThumbnail product={product} />
                                <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
                                <span className="shrink-0 text-right">
                                  <span className="block text-xs text-muted-foreground">{product.category}</span>
                                  <span className="block text-xs font-semibold text-primary">{formatSuggestionPrice(product.price)}</span>
                                </span>
                              </button>
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
                <Link href={`/products/${product.id}`} key={product.id}>
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

      {/* ── Testimonials ── */}
      <section className="py-24 bg-muted/30">
        <FullWide>
          <div className="text-center mb-16">
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-5xl font-light text-foreground mb-3">
              {t(translations.testimonials.sectionTitle, lang)}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="bg-card rounded-2xl border border-border/60 p-8 card-hover">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[oklch(0.72_0.12_75)] text-[oklch(0.72_0.12_75)]" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
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
