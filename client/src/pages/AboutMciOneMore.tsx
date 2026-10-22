import { useEffect } from "react";
import { ArrowRight, Globe2, Heart, Leaf, ShieldCheck, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import FullWide from "@/components/FullWide";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";

const statCards = [
  { value: "100+", key: "statCountries", icon: Globe2 },
  { value: "7+", key: "statUsers", icon: Users },
  { value: "650,000+", key: "statDistributors", icon: ShieldCheck },
  { value: "98%", key: "statSatisfaction", icon: Heart },
] as const;

export default function AboutMciOneMore() {
  const { lang } = useLanguage();
  const copy = translations.aboutPage;

  useEffect(() => {
    document.title = `${t(copy.eyebrow, lang)} | ${t(copy.title, lang)}`;
  }, [copy, lang]);

  return (
    <MainLayout>
      <section className="relative overflow-hidden bg-[#071f24] text-white">
        <img src="/manus-storage/cover_9c4157a9.jpg" alt={t(copy.eyebrow, lang)} className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f24] via-[#071f24]/85 to-[#071f24]/35" />
        <FullWide className="relative py-24 sm:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c6e36c]">{t(copy.eyebrow, lang)}</p>
            <h1 className="mt-5 font-sans text-5xl font-semibold leading-tight sm:text-7xl">{t(copy.title, lang)}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">{t(copy.lead, lang)}</p>
          </div>
        </FullWide>
      </section>

      <section className="bg-background py-20 sm:py-28">
        <FullWide>
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{t(copy.companyLabel, lang)}</p>
              <h2 className="mt-4 font-serif text-4xl font-light leading-tight text-foreground sm:text-5xl">{t(copy.companyName, lang)}</h2>
              <p className="mt-6 text-base leading-8 text-muted-foreground">{t(copy.storyBody, lang)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90"><Link href="/technology">{t(translations.nav.technology, lang)} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Button asChild variant="outline"><Link href="/products">{t(copy.cta, lang)}</Link></Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-muted/20 shadow-xl">
              <img src="/manus-storage/slimstyle_9cef89df.jpg" alt={t(copy.storyHeading, lang)} className="aspect-[0.95] w-full object-cover object-center" />
            </div>
          </div>
        </FullWide>
      </section>

      <section className="bg-[#0b55d8] py-16 text-white sm:py-20">
        <FullWide>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{t(copy.eyebrow, lang)}</p>
            <h2 className="mt-4 font-sans text-4xl font-semibold sm:text-5xl">{t(copy.reachHeading, lang)}</h2>
            <p className="mt-5 text-base leading-8 text-white/75">{t(copy.reachBody, lang)}</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(({ value, key, icon: Icon }) => (
              <div key={key} className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-[#c6e36c]" aria-hidden="true" />
                <p className="mt-5 font-serif text-4xl">{value}</p>
                <p className="mt-2 text-sm leading-5 text-white/70">{t(copy[key], lang)}</p>
              </div>
            ))}
          </div>
        </FullWide>
      </section>

      <section className="bg-[#f4f7f1] py-20 sm:py-28">
        <FullWide>
          <div className="mx-auto max-w-3xl text-center">
            <Leaf className="mx-auto h-8 w-8 text-[#7b9d15]" aria-hidden="true" />
            <h2 className="mt-4 font-sans text-4xl font-semibold text-[#243321] sm:text-5xl">{t(copy.valuesHeading, lang)}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [copy.value1, copy.value1Body],
              [copy.value2, copy.value2Body],
              [copy.value3, copy.value3Body],
            ].map(([heading, body]) => (
              <article key={t(heading, lang)} className="rounded-2xl border border-[#d6e0d3] bg-white/80 p-7 shadow-sm">
                <h3 className="font-semibold text-[#243321]">{t(heading, lang)}</h3>
                <p className="mt-3 text-sm leading-7 text-[#556340]">{t(body, lang)}</p>
              </article>
            ))}
          </div>
        </FullWide>
      </section>
    </MainLayout>
  );
}
