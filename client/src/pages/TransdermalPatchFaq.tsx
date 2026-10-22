import { useEffect } from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MainLayout from "@/components/MainLayout";
import FullWide from "@/components/FullWide";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";
import { buildFaqPageJsonLd, serializePageJsonLd } from "@shared/pageSchema";

export default function TransdermalPatchFaq() {
  const { lang } = useLanguage();
  const copy = translations.faqPage;

  useEffect(() => {
    document.title = `${t(copy.title, lang)} | MCI One More`;
  }, [copy, lang]);

  useEffect(() => {
    const existingSchema = document.querySelector<HTMLScriptElement>('script[data-faq-page-schema="true"]');
    const previousSchema = existingSchema?.textContent;
    const schemaElement = existingSchema ?? document.createElement("script");
    const createdSchema = !existingSchema;

    if (createdSchema) {
      schemaElement.type = "application/ld+json";
      schemaElement.dataset.faqPageSchema = "true";
      document.head.appendChild(schemaElement);
    }

    schemaElement.textContent = serializePageJsonLd(buildFaqPageJsonLd({
      name: t(copy.title, lang),
      description: t(copy.lead, lang),
      urlPath: "/faq-transdermal",
      imagePath: "/manus-storage/transdermal_5b18ecbe.jpg",
      inLanguage: lang,
      questions: copy.questions.map((item) => ({
        question: t(item.question, lang),
        answer: t(item.answer, lang),
      })),
    }));

    return () => {
      if (createdSchema) schemaElement.remove();
      else schemaElement.textContent = previousSchema ?? "";
    };
  }, [copy, lang]);

  return (
    <MainLayout>
      <section className="bg-[#071f24] py-20 text-white sm:py-28">
        <FullWide>
          <div className="mx-auto max-w-4xl text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-[#c6e36c]" aria-hidden="true" />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#c6e36c]">{t(copy.eyebrow, lang)}</p>
            <h1 className="mt-5 font-sans text-4xl font-semibold leading-tight sm:text-6xl">{t(copy.title, lang)}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/75">{t(copy.lead, lang)}</p>
          </div>
        </FullWide>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <FullWide>
          <div className="mx-auto max-w-4xl rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-10">
            <Accordion type="single" collapsible className="w-full">
              {copy.questions.map((item, index) => (
                <AccordionItem value={`question-${index + 1}`} key={`question-${index + 1}`}>
                  <AccordionTrigger className="text-left text-base sm:text-lg">{t(item.question, lang)}</AccordionTrigger>
                  <AccordionContent className="max-w-3xl text-base leading-7 text-muted-foreground">{t(item.answer, lang)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FullWide>
      </section>

      <section className="bg-[#f4f7f1] py-16 sm:py-20">
        <FullWide>
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-[#d6e0d3] bg-white p-7 shadow-sm sm:flex-row sm:items-center sm:p-10">
            <div>
              <p className="text-sm leading-7 text-[#556340]">{t(copy.lead, lang)}</p>
            </div>
            <Button asChild className="shrink-0 bg-[#0b55d8] text-white hover:bg-[#0b55d8]/90">
              <Link href="/technology">{t(copy.cta, lang)} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </FullWide>
      </section>
    </MainLayout>
  );
}
