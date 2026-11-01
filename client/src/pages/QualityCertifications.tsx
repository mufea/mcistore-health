import { useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations, type Language } from "@/lib/i18n";

const CANONICAL_ORIGIN = "https://mcionemore.com";

type LocalizedText = Record<Language, string>;
type QualityCard = { label: LocalizedText; detail: LocalizedText; alt: LocalizedText; src: string; srcSet: string };

const qualityCards: QualityCard[] = [
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
];

function FullWide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 ${className}`}>{children}</div>;
}

function serializeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export default function QualityCertifications() {
  const { lang } = useLanguage();
  const copy = translations.qualityHome;

  useEffect(() => {
    const title = `${t(copy.eyebrow, lang)} | MCI One More`;
    const description = t(copy.pageLead, lang);
    document.title = title;
    const descriptionElement = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = descriptionElement?.content;
    if (descriptionElement) descriptionElement.content = description;

    const existingSchema = document.querySelector<HTMLScriptElement>('script[data-quality-certifications-schema="true"]');
    const previousSchema = existingSchema?.textContent;
    const schemaElement = existingSchema ?? document.createElement("script");
    const createdSchema = !existingSchema;
    if (createdSchema) {
      schemaElement.type = "application/ld+json";
      schemaElement.dataset.qualityCertificationsSchema = "true";
      document.head.appendChild(schemaElement);
    }
    schemaElement.textContent = serializeJsonLd({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: `${CANONICAL_ORIGIN}/quality-certifications`,
      inLanguage: lang,
      isPartOf: { "@type": "WebSite", name: "MCI One More", url: CANONICAL_ORIGIN },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: qualityCards.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: t(card.label, lang),
          description: t(card.detail, lang),
          image: `${CANONICAL_ORIGIN}${card.src}`,
        })),
      },
    });

    return () => {
      if (descriptionElement && previousDescription !== undefined) descriptionElement.content = previousDescription;
      if (createdSchema) schemaElement.remove();
      else schemaElement.textContent = previousSchema ?? "";
    };
  }, [copy, lang]);

  return (
    <MainLayout>
      <section className="bg-[#071f24] py-20 text-white sm:py-28">
        <FullWide>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c6e36c]">{t(copy.pageEyebrow, lang)}</p>
            <h1 className="mt-5 font-serif text-4xl font-light leading-tight sm:text-6xl">{t(copy.title, lang)}</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/75">{t(copy.pageLead, lang)}</p>
          </div>
        </FullWide>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <FullWide>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-light text-foreground sm:text-5xl">{t(copy.title, lang)}</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">{t(copy.description, lang)}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-3">
            {qualityCards.map((card) => (
              <article key={card.src} className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
                <img src={card.src} srcSet={card.srcSet} sizes="(max-width: 1023px) 100vw, 33vw" alt={t(card.alt, lang)} loading="lazy" decoding="async" className="aspect-[9/16] w-full object-cover object-top" />
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div>
                      <h2 className="font-semibold text-foreground">{t(card.label, lang)}</h2>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{t(card.detail, lang)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-muted-foreground">{t(copy.note, lang)}</p>
        </FullWide>
      </section>

      <section className="bg-[#f4f7f1] py-16 sm:py-20">
        <FullWide>
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#d6e0d3] bg-white p-7 shadow-sm sm:flex-row sm:items-center sm:p-10">
            <p className="max-w-2xl text-base leading-7 text-[#556340]">{t(copy.pageLead, lang)}</p>
            <Button asChild className="shrink-0 gap-2 bg-[#0b55d8] text-white hover:bg-[#0b55d8]/90">
              <Link href="/products">{t(copy.pageCta, lang)} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </FullWide>
      </section>
    </MainLayout>
  );
}
