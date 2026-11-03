export type TransdermalNutritionItem = {
  title: string;
  description: string;
};

export type TransdermalNutritionContent = {
  enabled: boolean;
  imageUrl: string;
  imageAlt: string;
  items: [TransdermalNutritionItem, TransdermalNutritionItem, TransdermalNutritionItem];
  note: string;
};

export const DEFAULT_TRANSDERMAL_NUTRITION: TransdermalNutritionContent = {
  enabled: true,
  imageUrl: "/manus-storage/PeluangBisnisSuplemenTempelPertamadiIndonesia-page-001-full_644f9941.webp",
  imageAlt: "Ilustrasi pemanfaatan nutrisi melalui transdermal patch",
  items: [
    { title: "Rutinitas harian", description: "Praktis ditempelkan pada kulit sesuai petunjuk penggunaan produk." },
    { title: "Pendamping gaya hidup aktif", description: "Mudah dibawa dan digunakan saat bekerja, bepergian, atau berolahraga ringan." },
    { title: "Perawatan yang konsisten", description: "Membantu membangun kebiasaan penggunaan nutrisi yang teratur dan nyaman." },
  ],
  note: "Gunakan sesuai petunjuk pada label produk. Produk bukan pengganti diagnosis atau perawatan medis profesional.",
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

const cleanText = (value: unknown, maxLength: number) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export function parseTransdermalNutrition(value?: string | null): TransdermalNutritionContent {
  if (!value?.trim()) return DEFAULT_TRANSDERMAL_NUTRITION;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isValidTransdermalNutrition(parsed)) return DEFAULT_TRANSDERMAL_NUTRITION;
    return {
      enabled: parsed.enabled,
      imageUrl: parsed.imageUrl.trim(),
      imageAlt: parsed.imageAlt.trim(),
      items: parsed.items.map((item) => ({ title: item.title.trim(), description: item.description.trim() })) as TransdermalNutritionContent["items"],
      note: parsed.note.trim(),
    };
  } catch {
    return DEFAULT_TRANSDERMAL_NUTRITION;
  }
}

export function isValidTransdermalNutrition(value: unknown): value is TransdermalNutritionContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Record<string, unknown>;
  if (typeof content.enabled !== "boolean") return false;
  if (typeof content.imageUrl !== "string" || !content.imageUrl.trim() || content.imageUrl.length > 1000 || !isAllowedImageUrl(content.imageUrl.trim())) return false;
  if (typeof content.imageAlt !== "string" || !content.imageAlt.trim() || content.imageAlt.length > 180) return false;
  if (!Array.isArray(content.items) || content.items.length !== 3) return false;
  if (!content.items.every((item) => {
    if (!item || typeof item !== "object") return false;
    const entry = item as Record<string, unknown>;
    return typeof entry.title === "string" && entry.title.trim().length > 0 && entry.title.length <= 100 &&
      typeof entry.description === "string" && entry.description.trim().length > 0 && entry.description.length <= 300;
  })) return false;
  return typeof content.note === "string" && content.note.length <= 400;
}

export function serializeTransdermalNutrition(content: TransdermalNutritionContent): string {
  return JSON.stringify({
    enabled: Boolean(content.enabled),
    imageUrl: cleanText(content.imageUrl, 1000),
    imageAlt: cleanText(content.imageAlt, 180),
    items: content.items.slice(0, 3).map((item) => ({
      title: cleanText(item.title, 100),
      description: cleanText(item.description, 300),
    })),
    note: cleanText(content.note, 400),
  });
}
