import { MCI_BRAND_MARK_URL } from "./brand";

const CANONICAL_ORIGIN = "https://mcionemore.com";
const ORGANIZATION = {
  "@type": "Organization",
  name: "MCI One More",
  url: CANONICAL_ORIGIN,
  logo: MCI_BRAND_MARK_URL,
};

type PageSchemaInput = {
  name: string;
  description: string;
  urlPath: string;
  imagePath: string;
  inLanguage: string;
};

export function buildAboutPageJsonLd(input: PageSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: input.name,
    description: input.description,
    url: `${CANONICAL_ORIGIN}${input.urlPath}`,
    inLanguage: input.inLanguage,
    isPartOf: {
      "@type": "WebSite",
      name: "MCI One More",
      url: CANONICAL_ORIGIN,
    },
    about: ORGANIZATION,
    publisher: ORGANIZATION,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${CANONICAL_ORIGIN}${input.imagePath}`,
    },
  };
}

export function buildTechArticleJsonLd(input: PageSchemaInput & { keywords: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: input.name,
    name: input.name,
    description: input.description,
    url: `${CANONICAL_ORIGIN}${input.urlPath}`,
    inLanguage: input.inLanguage,
    articleSection: "Transdermal technology",
    keywords: input.keywords,
    image: [`${CANONICAL_ORIGIN}${input.imagePath}`],
    author: ORGANIZATION,
    publisher: ORGANIZATION,
    isPartOf: {
      "@type": "WebSite",
      name: "MCI One More",
      url: CANONICAL_ORIGIN,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${CANONICAL_ORIGIN}${input.urlPath}`,
    },
  };
}

export function buildFaqPageJsonLd(input: PageSchemaInput & { questions: Array<{ question: string; answer: string }> }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: input.name,
    description: input.description,
    url: `${CANONICAL_ORIGIN}${input.urlPath}`,
    inLanguage: input.inLanguage,
    mainEntity: input.questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
    publisher: ORGANIZATION,
  };
}

export function serializePageJsonLd(schema: object) {
  return JSON.stringify(schema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
