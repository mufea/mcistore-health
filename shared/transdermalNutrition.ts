export const TRANSDERMAL_LANGUAGES = ["en", "ar", "zh", "es", "hi", "id"] as const;
export type TransdermalLanguage = (typeof TRANSDERMAL_LANGUAGES)[number];

export type TransdermalNutritionItem = {
  title: string;
  description: string;
};

export type TransdermalNutritionLocale = {
  eyebrow: string;
  title: string;
  description: string;
  items: [TransdermalNutritionItem, TransdermalNutritionItem, TransdermalNutritionItem];
  note: string;
  ctaLabel: string;
};

export type TransdermalNutritionImage = {
  url: string;
  alt: Record<TransdermalLanguage, string>;
};

export type TransdermalNutritionContent = {
  enabled: boolean;
  images: TransdermalNutritionImage[];
  content: Record<TransdermalLanguage, TransdermalNutritionLocale>;
  contact: {
    enabled: boolean;
    url: string;
    label: Record<TransdermalLanguage, string>;
  };
};

const locale = (
  eyebrow: string,
  title: string,
  description: string,
  itemTitles: [string, string, string],
  itemDescriptions: [string, string, string],
  note: string,
  ctaLabel: string,
): TransdermalNutritionLocale => ({
  eyebrow,
  title,
  description,
  items: itemTitles.map((title, index) => ({ title, description: itemDescriptions[index] })) as TransdermalNutritionLocale["items"],
  note,
  ctaLabel,
});

const sameImageAlt = (value: string): Record<TransdermalLanguage, string> => Object.fromEntries(
  TRANSDERMAL_LANGUAGES.map((language) => [language, value]),
) as Record<TransdermalLanguage, string>;

const sameContactLabel = (value: string): Record<TransdermalLanguage, string> => Object.fromEntries(
  TRANSDERMAL_LANGUAGES.map((language) => [language, value]),
) as Record<TransdermalLanguage, string>;

const defaultLocale = locale(
  "Transdermal Patch Nutrition",
  "Practical wellness support through transdermal nutrition",
  "Explore practical ways to include transdermal patches in a consistent, active daily routine.",
  ["Daily routine", "Active lifestyle companion", "Consistent care"],
  [
    "Apply the patch to clean, dry skin according to the product instructions.",
    "Easy to carry and use while working, travelling, or enjoying light activity.",
    "Build a comfortable and consistent wellness habit with clear product guidance.",
  ],
  "Use according to the product label. This product is not a substitute for professional medical diagnosis or treatment.",
  "Explore Transdermal Patches",
);

const defaultContent: Record<TransdermalLanguage, TransdermalNutritionLocale> = {
  en: defaultLocale,
  ar: locale("تغذية عبر لصقات الجلد", "دعم عملي للعافية من خلال التغذية عبر الجلد", "اكتشف طرقاً عملية لإدخال لصقات الجلد في روتين يومي منتظم ونشط.", ["الروتين اليومي", "رفيق نمط الحياة النشط", "العناية المنتظمة"], ["ضع اللصقة على بشرة نظيفة وجافة وفقاً لتعليمات المنتج.", "سهلة الحمل والاستخدام أثناء العمل أو السفر أو النشاط الخفيف.", "كوّن عادة عافية مريحة ومنتظمة مع إرشادات واضحة للمنتج."], "استخدم المنتج وفقاً للملصق. هذا المنتج ليس بديلاً عن التشخيص أو العلاج الطبي المتخصص.", "استكشف لصقات الجلد"),
  zh: locale("经皮贴片营养", "通过经皮营养支持日常健康", "探索将经皮贴片融入规律、积极日常生活的实用方式。", ["日常习惯", "活跃生活伴侣", "持续护理"], ["按照产品说明将贴片贴在清洁、干燥的皮肤上。", "工作、旅行或进行轻度活动时都易于携带和使用。", "根据清晰的产品指引，建立舒适而规律的健康习惯。"], "请按照产品标签使用。本产品不能替代专业医疗诊断或治疗。", "探索经皮贴片"),
  es: locale("Nutrición con parches transdérmicos", "Bienestar práctico mediante nutrición transdérmica", "Descubre formas prácticas de incorporar parches transdérmicos a una rutina diaria activa y constante.", ["Rutina diaria", "Compañero para un estilo de vida activo", "Cuidado constante"], ["Aplica el parche sobre la piel limpia y seca según las instrucciones del producto.", "Es fácil de llevar y usar mientras trabajas, viajas o realizas actividad ligera.", "Crea un hábito de bienestar cómodo y constante con una guía clara del producto."], "Usa el producto según la etiqueta. No sustituye el diagnóstico ni el tratamiento médico profesional.", "Explorar parches transdérmicos"),
  hi: locale("ट्रांसडर्मल पैच पोषण", "ट्रांसडर्मल पोषण से व्यावहारिक वेलनेस सहायता", "ट्रांसडर्मल पैच को नियमित और सक्रिय दैनिक जीवन में शामिल करने के व्यावहारिक तरीके जानें।", ["दैनिक दिनचर्या", "सक्रिय जीवनशैली का साथी", "नियमित देखभाल"], ["उत्पाद के निर्देशों के अनुसार पैच को साफ और सूखी त्वचा पर लगाएँ।", "काम, यात्रा या हल्की गतिविधि के दौरान इसे साथ ले जाना और उपयोग करना आसान है।", "स्पष्ट उत्पाद मार्गदर्शन के साथ आरामदायक और नियमित वेलनेस आदत बनाएँ।"], "उत्पाद लेबल के अनुसार उपयोग करें। यह पेशेवर चिकित्सकीय निदान या उपचार का विकल्प नहीं है।", "ट्रांसडर्मल पैच देखें"),
  id: locale("Nutrisi Transdermal Patch", "Dukungan kebugaran praktis melalui nutrisi transdermal", "Temukan cara praktis memasukkan patch transdermal ke dalam rutinitas harian yang aktif dan konsisten.", ["Rutinitas harian", "Pendamping gaya hidup aktif", "Perawatan yang konsisten"], ["Tempelkan patch pada kulit yang bersih dan kering sesuai petunjuk produk.", "Mudah dibawa dan digunakan saat bekerja, bepergian, atau beraktivitas ringan.", "Bangun kebiasaan kebugaran yang nyaman dan konsisten dengan panduan produk yang jelas."], "Gunakan sesuai petunjuk pada label. Produk ini bukan pengganti diagnosis atau perawatan medis profesional.", "Jelajahi Patch Transdermal"),
};

export const DEFAULT_TRANSDERMAL_NUTRITION: TransdermalNutritionContent = {
  enabled: true,
  images: [
    {
      url: "/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-001-full_644f9941.webp",
      alt: sameImageAlt("Transdermal patch nutrition use illustration"),
    },
    {
      url: "/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-002-full_e91f74d9.webp",
      alt: sameImageAlt("Transdermal patch application and routine illustration"),
    },
    {
      url: "/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-003-full_f5204d68.webp",
      alt: sameImageAlt("Transdermal patch wellness information illustration"),
    },
  ],
  content: defaultContent,
  contact: {
    enabled: true,
    url: "",
    label: {
      en: "Consult with us",
      ar: "استشرنا",
      zh: "咨询我们",
      es: "Consultar con nosotros",
      hi: "हमसे परामर्श करें",
      id: "Konsultasi dengan kami",
    },
  },
};

const isAllowedImageUrl = (value: string) => {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const isAllowedContactUrl = (value: string) => {
  if (value.startsWith("tel:") || value.startsWith("mailto:")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const cleanText = (value: unknown, maxLength: number) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const normalizeLocale = (value: unknown, fallback: TransdermalNutritionLocale): TransdermalNutritionLocale => {
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Record<string, unknown>;
  const items = Array.isArray(raw.items) ? raw.items : [];
  return {
    eyebrow: cleanText(raw.eyebrow, 100) || fallback.eyebrow,
    title: cleanText(raw.title, 180) || fallback.title,
    description: cleanText(raw.description, 500) || fallback.description,
    items: [0, 1, 2].map((index) => {
      const item = items[index] && typeof items[index] === "object" ? items[index] as Record<string, unknown> : {};
      return {
        title: cleanText(item.title, 100) || fallback.items[index].title,
        description: cleanText(item.description, 300) || fallback.items[index].description,
      };
    }) as TransdermalNutritionLocale["items"],
    note: cleanText(raw.note, 400) || fallback.note,
    ctaLabel: cleanText(raw.ctaLabel, 100) || fallback.ctaLabel,
  };
};

const normalizeLocalizedRecord = <T>(value: unknown, fallback: Record<TransdermalLanguage, T>, normalizer: (value: unknown, fallback: T) => T) =>
  Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, normalizer(
    value && typeof value === "object" ? (value as Record<string, unknown>)[language] : undefined,
    fallback[language],
  )])) as Record<TransdermalLanguage, T>;

export function parseTransdermalNutrition(value?: string | null): TransdermalNutritionContent {
  if (!value?.trim()) return DEFAULT_TRANSDERMAL_NUTRITION;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isValidTransdermalNutrition(parsed)) {
      if (!isValidLegacyTransdermalNutrition(parsed)) return DEFAULT_TRANSDERMAL_NUTRITION;
      const legacy = parsed as LegacyTransdermalNutritionContent;
      const legacyLocale = locale(
        DEFAULT_TRANSDERMAL_NUTRITION.content.en.eyebrow,
        DEFAULT_TRANSDERMAL_NUTRITION.content.en.title,
        DEFAULT_TRANSDERMAL_NUTRITION.content.en.description,
        legacy.items.map((item) => item.title) as [string, string, string],
        legacy.items.map((item) => item.description) as [string, string, string],
        legacy.note,
        DEFAULT_TRANSDERMAL_NUTRITION.content.en.ctaLabel,
      );
      return {
        enabled: legacy.enabled,
        images: [{ url: legacy.imageUrl.trim(), alt: sameImageAlt(legacy.imageAlt.trim()) }],
        content: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, legacyLocale])) as Record<TransdermalLanguage, TransdermalNutritionLocale>,
        contact: DEFAULT_TRANSDERMAL_NUTRITION.contact,
      };
    }
    const content = parsed as TransdermalNutritionContent;
    return {
      enabled: content.enabled,
      images: content.images.map((image) => ({ url: image.url.trim(), alt: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, image.alt[language].trim()])) as Record<TransdermalLanguage, string> })),
      content: normalizeLocalizedRecord(content.content, DEFAULT_TRANSDERMAL_NUTRITION.content, normalizeLocale),
      contact: {
        enabled: content.contact.enabled,
        url: content.contact.url.trim(),
        label: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, content.contact.label[language].trim()])) as Record<TransdermalLanguage, string>,
      },
    };
  } catch {
    return DEFAULT_TRANSDERMAL_NUTRITION;
  }
}

type LegacyTransdermalNutritionContent = {
  enabled: boolean;
  imageUrl: string;
  imageAlt: string;
  items: [TransdermalNutritionItem, TransdermalNutritionItem, TransdermalNutritionItem];
  note: string;
};

function isValidLegacyTransdermalNutrition(value: unknown): value is LegacyTransdermalNutritionContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  return typeof content.enabled === "boolean" && typeof content.imageUrl === "string" && Boolean(content.imageUrl.trim()) && content.imageUrl.length <= 1000 && isAllowedImageUrl(content.imageUrl.trim()) &&
    typeof content.imageAlt === "string" && Boolean(content.imageAlt.trim()) && content.imageAlt.length <= 180 && Array.isArray(content.items) && content.items.length === 3 &&
    content.items.every((item) => item && typeof item === "object" && typeof (item as Record<string, unknown>).title === "string" && Boolean((item as Record<string, unknown>).title?.toString().trim()) && typeof (item as Record<string, unknown>).description === "string" && Boolean((item as Record<string, unknown>).description?.toString().trim())) &&
    typeof content.note === "string" && content.note.length <= 400;
}

export function isValidTransdermalNutrition(value: unknown): value is TransdermalNutritionContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  if (typeof content.enabled !== "boolean" || !Array.isArray(content.images) || content.images.length < 1 || content.images.length > 6) return false;
  if (!content.images.every((image) => {
    if (!image || typeof image !== "object") return false;
    const entry = image as Record<string, unknown>;
    const alt = entry.alt;
    return typeof entry.url === "string" && entry.url.trim().length > 0 && entry.url.length <= 1000 && isAllowedImageUrl(entry.url.trim()) &&
      alt && typeof alt === "object" && TRANSDERMAL_LANGUAGES.every((language) => typeof (alt as Record<string, unknown>)[language] === "string" && Boolean((alt as Record<string, unknown>)[language]?.toString().trim()) && (alt as Record<string, unknown>)[language]!.toString().length <= 180);
  })) return false;
  if (!content.content || typeof content.content !== "object" || !TRANSDERMAL_LANGUAGES.every((language) => {
    const localeContent = (content.content as Record<string, unknown>)[language];
    if (!localeContent || typeof localeContent !== "object") return false;
    const entry = localeContent as Record<string, unknown>;
    return typeof entry.eyebrow === "string" && entry.eyebrow.trim().length > 0 && entry.eyebrow.length <= 100 &&
      typeof entry.title === "string" && entry.title.trim().length > 0 && entry.title.length <= 180 &&
      typeof entry.description === "string" && entry.description.trim().length > 0 && entry.description.length <= 500 &&
      Array.isArray(entry.items) && entry.items.length === 3 && entry.items.every((item) => item && typeof item === "object" && typeof (item as Record<string, unknown>).title === "string" && (item as Record<string, unknown>).title!.toString().trim().length > 0 && (item as Record<string, unknown>).title!.toString().length <= 100 && typeof (item as Record<string, unknown>).description === "string" && (item as Record<string, unknown>).description!.toString().trim().length > 0 && (item as Record<string, unknown>).description!.toString().length <= 300) &&
      typeof entry.note === "string" && entry.note.length <= 400 && typeof entry.ctaLabel === "string" && entry.ctaLabel.trim().length > 0 && entry.ctaLabel.length <= 100;
  })) return false;
  if (!content.contact || typeof content.contact !== "object") return false;
  const contact = content.contact as Record<string, unknown>;
  return typeof contact.enabled === "boolean" && typeof contact.url === "string" && contact.url.length <= 1000 && (!contact.url.trim() || isAllowedContactUrl(contact.url.trim())) &&
    Boolean(contact.label) && typeof contact.label === "object" && TRANSDERMAL_LANGUAGES.every((language) => typeof (contact.label as Record<string, unknown>)[language] === "string" && (contact.label as Record<string, unknown>)[language]!.toString().length <= 100);
}

export function serializeTransdermalNutrition(content: TransdermalNutritionContent): string {
  const normalized = parseTransdermalNutrition(JSON.stringify(content));
  return JSON.stringify({
    enabled: Boolean(normalized.enabled),
    images: normalized.images.slice(0, 6).map((image) => ({
      url: cleanText(image.url, 1000),
      alt: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, cleanText(image.alt[language], 180)])),
    })),
    content: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => {
      const localeContent = normalized.content[language];
      return [language, {
        eyebrow: cleanText(localeContent.eyebrow, 100),
        title: cleanText(localeContent.title, 180),
        description: cleanText(localeContent.description, 500),
        items: localeContent.items.map((item) => ({ title: cleanText(item.title, 100), description: cleanText(item.description, 300) })),
        note: cleanText(localeContent.note, 400),
        ctaLabel: cleanText(localeContent.ctaLabel, 100),
      }];
    })),
    contact: {
      enabled: Boolean(normalized.contact.enabled),
      url: cleanText(normalized.contact.url, 1000),
      label: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, cleanText(normalized.contact.label[language], 100)])),
    },
  });
}
