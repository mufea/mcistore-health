import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowRight, CheckCircle, Heart, ImageOff, Leaf, Search, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
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

  const goToSuggestion = (slug: string) => {
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    navigate(buildProductPath(slug));
  };

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
      {/* ── Brochure-inspired cover hero ── */}
      <section className="relative isolate overflow-hidden bg-[#071f24] text-white">
        <img src="/manus-storage/cover_9c4157a9.jpg" alt="MCI One More botanical cover" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,20,22,.9),rgba(3,20,22,.55),rgba(3,20,22,.2))]" />
        <FullWide className="relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <Badge className="mb-6 border-white/25 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-white backdrop-blur-sm hover:bg-white/15">
              MCI One More International
            </Badge>
            <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">
              Feel healthy.
              <span className="mt-2 block font-serif font-light italic text-[#c6e36c]">Energetic and happy.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
              New-generation wellness products inspired by nature, designed to help you make one more healthy choice every day.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-[#c6e36c] px-7 text-[#071f24] hover:bg-[#d8ef8b]">
                <Link href="/products">Explore the collection <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/35 bg-white/5 px-7 text-white hover:bg-white/15 hover:text-white">
                <Link href="/survey">Find your wellness match</Link>
              </Button>
            </div>
            <form
              role="search"
              className="mt-8 flex max-w-xl gap-2"
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
              <div ref={searchContainerRef} className="relative flex-1" onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setSuggestionsOpen(false);
                  setActiveSuggestionIndex(-1);
                }
              }}>
                <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/60" aria-hidden="true" />
                <Input
                  id="home-product-search"
                  type="search"
                  value={productSearch}
                  onChange={(event) => { setProductSearch(event.target.value); setSuggestionsOpen(true); setActiveSuggestionIndex(-1); }}
                  onFocus={() => setSuggestionsOpen(true)}
                  placeholder="Search products or ingredients..."
                  className="h-12 border-white/20 bg-white/10 pl-9 text-white placeholder:text-white/55 backdrop-blur-sm"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-controls="home-product-suggestions"
                  aria-activedescendant={activeSuggestionIndex >= 0 ? `home-product-suggestion-${suggestions[activeSuggestionIndex]?.id}` : undefined}
                />
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-border/70 bg-popover text-popover-foreground shadow-lg">
                    <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(translations.hero.suggestionsLabel, lang)}</p>
                    {suggestionState === "loading" ? <p role="status" className="px-3 py-3 text-sm text-muted-foreground">{t(translations.hero.suggestionsLoading, lang)}</p> : suggestionState === "error" ? <p role="alert" className="px-3 py-3 text-sm text-muted-foreground">{t(translations.hero.suggestionsError, lang)}</p> : suggestionState === "results" ? (
                      <ul id="home-product-suggestions" role="listbox" className="pb-1">
                        {suggestions.map((product, index) => (
                          <li key={product.id} id={`home-product-suggestion-${product.id}`} role="option" aria-selected={index === activeSuggestionIndex} className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${index === activeSuggestionIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/70"}`}>
                            <button type="button" className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left text-sm" onMouseDown={(event) => event.preventDefault()} onClick={() => goToSuggestion(product.slug)}>
                              <SuggestionThumbnail product={product} />
                              <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
                              <span className="shrink-0 text-right"><span className="block text-xs text-muted-foreground">{product.category}</span><span className="block text-xs font-semibold text-primary">{formatSuggestionPrice(product.price)}</span></span>
                            </button>
                            <SuggestionAddToCartButton product={product} isAuthenticated={isAuthenticated} onAdded={() => { setSuggestionsOpen(false); setActiveSuggestionIndex(-1); }} onRequireSignIn={() => { setSuggestionsOpen(false); setActiveSuggestionIndex(-1); window.location.href = getLoginUrl(); }} />
                          </li>
                        ))}
                      </ul>
                    ) : <p className="px-3 py-3 text-sm text-muted-foreground">{t(translations.hero.noSuggestions, lang)}</p>}
                    <button type="submit" className="flex w-full border-t border-border/60 px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-accent/70">{t(translations.hero.viewAllResults, lang)}</button>
                  </div>
                )}
              </div>
              <Button type="submit" variant="outline" className="h-12 shrink-0 border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white">Search</Button>
            </form>
          </div>
          <div className="mt-14 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.16em] text-white/75">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">Transdermal wave technology</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">Nature-led formulas</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">Read the instructions</span>
          </div>
        </FullWide>
      </section>

      {/* ── Brand story: nature + transdermal technology ── */}
      <section className="bg-[#f4f7f1] py-20 sm:py-28">
        <FullWide>
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <div className="mb-4 h-1 w-12 bg-[#0b55d8]" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0b55d8]">The MCI One More approach</p>
              <h2 className="mt-4 max-w-xl font-sans text-4xl font-semibold leading-tight text-[#0c2730] sm:text-5xl">
                Nature-led wellness, made for modern routines.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#45616a]">
                The brochure brings together botanical ingredients, vitamins, minerals, and transdermal wave technology in a clear, human way. Our storefront now follows that same rhythm: understand your needs, explore the collection, and choose the ritual that fits your day.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {["Botanical ingredients", "Transdermal wave technology", "Clear product guidance", "A daily choice for feeling well"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-[#d6e0d3] bg-white/70 px-4 py-3 text-sm font-medium text-[#23434b]">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#0b55d8]" />{item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0b55d8] shadow-2xl">
              <img src="/manus-storage/transdermal_5b18ecbe.jpg" alt="MCI One More transdermal wave technology brochure visual" className="h-full min-h-[28rem] w-full object-cover object-center mix-blend-screen opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#062b7b]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-9">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Transdermal wave technology</p>
                <p className="mt-2 max-w-md font-serif text-3xl leading-tight sm:text-4xl">A more considered way to bring wellness into your routine.</p>
              </div>
            </div>
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

      {/* ── Slimstyle story from the brochure ── */}
      <section className="overflow-hidden bg-[#fff9dc] py-20 sm:py-28">
        <FullWide>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7b9d15]">Slimstyle by MCI One More</p>
              <h2 className="mt-4 max-w-xl font-sans text-4xl font-semibold leading-tight text-[#243321] sm:text-5xl">Ready to live lighter, one choice at a time?</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#556340]">The brochure introduces Slimstyle through a simple promise: a plant-forward routine supported by transdermal technology. Start with your goals, then let the survey guide you to the products that belong in your everyday rhythm.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-[#7b9d15] text-white hover:bg-[#698811]"><Link href="/survey">Start the wellness survey <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="border-[#7b9d15]/40 text-[#526b11] hover:bg-[#7b9d15]/10"><Link href="/products?category=Transdermal%20Patch">Browse transdermal patches</Link></Button>
              </div>
            </div>
            <div className="order-1 mx-auto w-full max-w-md overflow-hidden rounded-[2rem] shadow-xl lg:order-2">
              <img src="/manus-storage/slimstyle_9cef89df.jpg" alt="Slimstyle by MCI One More brochure product visual" className="aspect-[0.705] w-full object-cover object-center" />
            </div>
          </div>
        </FullWide>
      </section>

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

      {/* ── Trust and product guidance ── */}
      <section className="bg-[#f7f9fc] py-20 sm:py-24">
        <FullWide>
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <div className="mb-4 h-1 w-12 bg-[#0b55d8]" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0b55d8]">Before using the product</p>
              <h2 className="mt-4 font-sans text-4xl font-semibold leading-tight text-[#122d67] sm:text-5xl">Read the instructions.</h2>
              <p className="mt-5 text-base leading-8 text-[#52627b]">Every product page is designed to make the next step clear. Follow the label, use products only as directed, and contact a qualified professional when you need personal advice.</p>
              <ul className="mt-7 space-y-3 text-sm text-[#253d61]">
                {["For external use only where indicated", "Apply only as directed on clean, dry skin", "Avoid injured or sensitive areas", "Review the product instructions before use"].map((item) => (
                  <li key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 shrink-0 bg-[#0b55d8]" />{item}</li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#dbe2ef] bg-white shadow-sm">
              <img src="/manus-storage/certificates_5d20144b.jpg" alt="MCI One More certification collage from the brochure" className="max-h-[32rem] w-full object-cover object-top" />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e9f1] px-5 py-4 text-xs font-medium uppercase tracking-[0.16em] text-[#62708a]">
                <span>Quality and documentation</span><span>Explore products with confidence</span>
              </div>
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
