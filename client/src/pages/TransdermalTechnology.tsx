import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import FullWide from "@/components/FullWide";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
import { buildTechArticleJsonLd, serializePageJsonLd } from "@shared/pageSchema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TransdermalTechnology() {
  const { lang } = useLanguage();
  const copy = translations.technologyPage;
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: Parameters<typeof t>[0];
  } | null>(null);

  useEffect(() => {
    document.title = `${t(copy.eyebrow, lang)} | MCI One More`;
  }, [copy, lang]);

  useEffect(() => {
    const existingSchema = document.querySelector<HTMLScriptElement>('script[data-tech-article-schema="true"]');
    const previousSchema = existingSchema?.textContent;
    const schemaElement = existingSchema ?? document.createElement("script");
    const createdSchema = !existingSchema;

    if (createdSchema) {
      schemaElement.type = "application/ld+json";
      schemaElement.dataset.techArticleSchema = "true";
      document.head.appendChild(schemaElement);
    }

    schemaElement.textContent = serializePageJsonLd(buildTechArticleJsonLd({
      name: t(copy.title, lang),
      description: t(copy.lead, lang),
      urlPath: "/technology",
      imagePath: "/manus-storage/transdermal_5b18ecbe.jpg",
      inLanguage: lang,
      keywords: ["transdermal technology", "transdermal patch", "MCI One More", "wellness products"],
    }));

    return () => {
      if (createdSchema) schemaElement.remove();
      else schemaElement.textContent = previousSchema ?? "";
    };
  }, [copy, lang]);

  const routes = [
    { number: "01", title: copy.step1, body: copy.step1Body },
    { number: "02", title: copy.step2, body: copy.step2Body },
    { number: "03", title: copy.step3, body: copy.step3Body },
  ];

  const gallery = [
    { src: "/manus-storage/transdermal_5b18ecbe.jpg", alt: copy.gallery1 },
    { src: "/manus-storage/slimstyle_9cef89df.jpg", alt: copy.gallery2 },
    { src: "/manus-storage/certificates_5d20144b.jpg", alt: copy.gallery3 },
  ];

  return (
    <MainLayout>
      <section className="bg-[#071f24] py-20 text-white sm:py-28">
        <FullWide>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c6e36c]">{t(copy.eyebrow, lang)}</p>
              <h1 className="mt-5 max-w-3xl font-sans text-5xl font-semibold leading-tight sm:text-7xl">{t(copy.title, lang)}</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">{t(copy.lead, lang)}</p>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl">
              <img src="/manus-storage/transdermal_5b18ecbe.jpg" alt={t(copy.gallery1, lang)} className="aspect-[0.82] w-full object-cover" />
            </div>
          </div>
        </FullWide>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <FullWide>
          <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t(copy.eyebrow, lang)}</p>
              <h2 className="mt-4 font-serif text-4xl font-light leading-tight text-foreground sm:text-5xl">{t(copy.overviewHeading, lang)}</h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">{t(copy.overviewBody, lang)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t(copy.stepsHeading, lang)}</h3>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {routes.map((route) => (
                  <article key={route.number} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                    <span className="font-serif text-3xl text-primary">{route.number}</span>
                    <h4 className="mt-5 font-semibold text-foreground">{t(route.title, lang)}</h4>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(route.body, lang)}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </FullWide>
      </section>

      <section className="bg-[#f4f7f1] py-20 sm:py-28">
        <FullWide>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0b55d8]">{t(copy.eyebrow, lang)}</p>
            <h2 className="mt-4 font-sans text-4xl font-semibold text-[#122d67] sm:text-5xl">{t(copy.certificatesHeading, lang)}</h2>
            <p className="mt-5 text-base leading-8 text-[#52627b]">{t(copy.certificatesBody, lang)}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {gallery.map((item) => (
              <figure key={item.src} className="group overflow-hidden rounded-2xl border border-[#d6e0d3] bg-white shadow-sm">
                <button type="button" className="block w-full cursor-zoom-in text-left" onClick={() => setSelectedImage(item)} aria-label={t(copy.viewImage, lang)}>
                  <img src={item.src} alt={t(item.alt, lang)} className="aspect-[0.9] w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </button>
                <figcaption className="flex items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-[#243321]">
                  <span>{t(item.alt, lang)}</span><ExternalLink className="h-4 w-4 shrink-0 text-[#0b55d8]" aria-hidden="true" />
                </figcaption>
              </figure>
            ))}
          </div>
        </FullWide>
      </section>

      <Dialog open={Boolean(selectedImage)} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl border-white/10 bg-[#071f24] p-3 text-white sm:p-5">
          <DialogTitle className="sr-only">{selectedImage ? t(selectedImage.alt, lang) : t(copy.certificatesHeading, lang)}</DialogTitle>
          <DialogDescription className="sr-only">{t(copy.viewImage, lang)}</DialogDescription>
          {selectedImage && (
            <img src={selectedImage.src} alt={t(selectedImage.alt, lang)} className="max-h-[78vh] w-full rounded-xl object-contain" />
          )}
        </DialogContent>
      </Dialog>

      <section className="bg-[#0b55d8] py-20 text-white sm:py-24">
        <FullWide>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-[#c6e36c]" /><p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{t(copy.safetyHeading, lang)}</p></div>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/80">{t(copy.safetyBody, lang)}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="bg-[#c6e36c] text-[#071f24] hover:bg-[#d8ef8b]"><Link href="/products?category=Transdermal%20Patch">{t(copy.cta, lang)} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <div className="flex items-center justify-center gap-2 text-xs text-white/65"><CheckCircle2 className="h-4 w-4" />{t(copy.certificatesHeading, lang)}</div>
            </div>
          </div>
        </FullWide>
      </section>
    </MainLayout>
  );
}
