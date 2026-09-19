# Contoh SEO Halaman Produk MCI Store

Contoh berikut dapat digunakan pada halaman detail produk seperti:

```text
https://mci-store.com/products/77
```

Implementasi ini menghasilkan metadata dinamis untuk setiap produk:

- `<title>`
- `meta description`
- canonical URL
- Open Graph
- Twitter Card
- Product JSON-LD
- BreadcrumbList JSON-LD

> Nilai `price`, `image`, `availability`, dan informasi produk harus berasal dari database. Jangan menambahkan rating atau review apabila data review asli belum tersedia.

## 1. Helper SEO Produk

Buat atau sesuaikan file `shared/productSeo.ts`:

```ts
const SITE_NAME = "MCI Store";
const SITE_ORIGIN = "https://mci-store.com";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/manus-storage/mci-health-mark_0e17589e.png`;
const MAX_DESCRIPTION_LENGTH = 160;

export type SeoProduct = {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  price: string | number;
  stock: number;
  imageUrl?: string | null;
  images?: Array<{ url: string }> | null;
  sku?: string | null;
  brand?: string | null;
};

export function getProductUrl(productId: number) {
  return `${SITE_ORIGIN}/products/${productId}`;
}

function absoluteUrl(url: string | null | undefined) {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function cleanDescription(product: SeoProduct) {
  const fallback = `${product.name} adalah produk kesehatan dan wellness dari ${SITE_NAME}${
    product.category ? ` dalam kategori ${product.category}` : ""
  }.`;

  const value = (product.description || fallback)
    .replace(/\\s+/g, " ")
    .trim();

  return value.length <= MAX_DESCRIPTION_LENGTH
    ? value
    : `${value.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

export function getProductImages(product: SeoProduct) {
  const images = [
    product.imageUrl,
    ...(product.images || []).map((image) => image.url),
  ]
    .filter((image): image is string => Boolean(image))
    .map(absoluteUrl);

  return Array.from(new Set(images.length > 0 ? images : [DEFAULT_IMAGE]));
}

export function buildProductSeo(product: SeoProduct) {
  const url = getProductUrl(product.id);
  const description = cleanDescription(product);
  const images = getProductImages(product);
  const price = Number(product.price);

  return {
    title: `${product.name} | ${SITE_NAME}`,
    description,
    url,
    images,
    price: Number.isFinite(price) ? price.toString() : "0",
    availability:
      product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
  };
}
```

## 2. Product Schema JSON-LD dan BreadcrumbList

Tambahkan helper berikut dalam file yang sama atau file `shared/productSchema.ts`:

```ts
export function buildProductJsonLd(product: SeoProduct) {
  const seo = buildProductSeo(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${seo.url}#product`,
    name: product.name,
    description: seo.description,
    url: seo.url,
    image: seo.images,
    category: product.category || undefined,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand
      ? {
          brand: {
            "@type": "Brand",
            name: product.brand,
          },
        }
      : {
          brand: {
            "@type": "Brand",
            name: "MCI Store",
          },
        }),
    offers: {
      "@type": "Offer",
      url: seo.url,
      price: seo.price,
      priceCurrency: "IDR",
      availability: seo.availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "MCI Store",
        url: "https://mci-store.com",
      },
    },
  };
}

export function buildBreadcrumbJsonLd(product: SeoProduct) {
  const productUrl = getProductUrl(product.id);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mci-store.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "https://mci-store.com/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };
}

export function serializeJsonLd(value: unknown) {
  // Mencegah karakter HTML tertentu ditafsirkan sebagai markup oleh browser.
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
```

## 3. React Component untuk Open Graph dan JSON-LD

Buat `client/src/components/ProductSeo.tsx`:

```tsx
import { useEffect } from "react";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductSeo,
  serializeJsonLd,
  type SeoProduct,
} from "@shared/productSeo";

type ProductSeoProps = {
  product: SeoProduct;
};

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element!.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
  return element;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"]`,
  );

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
  return element;
}

function upsertJsonLd(id: string, value: unknown) {
  let script = document.head.querySelector<HTMLScriptElement>(
    `script[data-seo-id="${id}"]`,
  );

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoId = id;
    document.head.appendChild(script);
  }

  script.textContent = serializeJsonLd(value);
  return script;
}

export default function ProductSeo({ product }: ProductSeoProps) {
  useEffect(() => {
    const seo = buildProductSeo(product);
    const previousTitle = document.title;
    document.title = seo.title;

    const description = upsertMeta(
      'meta[name="description"]',
      { name: "description" },
      seo.description,
    );

    const canonical = upsertLink("canonical", seo.url);

    const ogTitle = upsertMeta(
      'meta[property="og:title"]',
      { property: "og:title" },
      seo.title,
    );
    const ogDescription = upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      seo.description,
    );
    const ogUrl = upsertMeta(
      'meta[property="og:url"]',
      { property: "og:url" },
      seo.url,
    );
    const ogType = upsertMeta(
      'meta[property="og:type"]',
      { property: "og:type" },
      "product",
    );
    const ogSiteName = upsertMeta(
      'meta[property="og:site_name"]',
      { property: "og:site_name" },
      "MCI Store",
    );
    const ogImage = upsertMeta(
      'meta[property="og:image"]',
      { property: "og:image" },
      seo.images[0],
    );
    const ogImageAlt = upsertMeta(
      'meta[property="og:image:alt"]',
      { property: "og:image:alt" },
      product.name,
    );
    const ogLocale = upsertMeta(
      'meta[property="og:locale"]',
      { property: "og:locale" },
      "id_ID",
    );

    const twitterCard = upsertMeta(
      'meta[name="twitter:card"]',
      { name: "twitter:card" },
      "summary_large_image",
    );
    const twitterTitle = upsertMeta(
      'meta[name="twitter:title"]',
      { name: "twitter:title" },
      seo.title,
    );
    const twitterDescription = upsertMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      seo.description,
    );
    const twitterImage = upsertMeta(
      'meta[name="twitter:image"]',
      { name: "twitter:image" },
      seo.images[0],
    );
    const twitterImageAlt = upsertMeta(
      'meta[name="twitter:image:alt"]',
      { name: "twitter:image:alt" },
      product.name,
    );

    const productSchema = upsertJsonLd(
      "product-schema",
      buildProductJsonLd(product),
    );
    const breadcrumbSchema = upsertJsonLd(
      "breadcrumb-schema",
      buildBreadcrumbJsonLd(product),
    );

    return () => {
      document.title = previousTitle;

      // Elemen yang dibuat/dikelola komponen dibersihkan saat berpindah halaman.
      [
        description,
        canonical,
        ogTitle,
        ogDescription,
        ogUrl,
        ogType,
        ogSiteName,
        ogImage,
        ogImageAlt,
        ogLocale,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterImageAlt,
        productSchema,
        breadcrumbSchema,
      ].forEach((element) => element.remove());
    };
  }, [product]);

  return null;
}
```

## 4. Gunakan pada `ProductDetail.tsx`

Import component dan render setelah data produk tersedia:

```tsx
import ProductSeo from "@/components/ProductSeo";
```

Kemudian:

```tsx
if (!product) {
  return (
    <MainLayout>
      <div className="min-h-[60vh]">Product not found</div>
    </MainLayout>
  );
}

return (
  <MainLayout>
    <ProductSeo product={product} />

    <main>
      {/* Breadcrumb visual */}
      <ProductBreadcrumb
        homeLabel="Home"
        productsLabel="Products"
        currentLabel={product.name}
      />

      {/* Konten detail produk lainnya */}
      <h1>{product.name}</h1>
    </main>
  </MainLayout>
);
```

## 5. HTML head yang dihasilkan

Untuk produk contoh dengan ID `77`, Google dan social crawler akan menerima metadata seperti:

```html
<title>Vitamin C 500 mg | MCI Store</title>
<meta
  name="description"
  content="Vitamin C 500 mg untuk dukungan kesehatan harian dari MCI Store."
/>
<link
  rel="canonical"
  href="https://mci-store.com/products/77"
/>

<meta property="og:type" content="product" />
<meta property="og:site_name" content="MCI Store" />
<meta property="og:title" content="Vitamin C 500 mg | MCI Store" />
<meta
  property="og:description"
  content="Vitamin C 500 mg untuk dukungan kesehatan harian dari MCI Store."
/>
<meta property="og:url" content="https://mci-store.com/products/77" />
<meta property="og:image" content="https://mci-store.com/manus-storage/vitamin-c.jpg" />
<meta property="og:image:alt" content="Vitamin C 500 mg" />
<meta property="og:locale" content="id_ID" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Vitamin C 500 mg | MCI Store" />
<meta
  name="twitter:description"
  content="Vitamin C 500 mg untuk dukungan kesehatan harian dari MCI Store."
/>
<meta name="twitter:image" content="https://mci-store.com/manus-storage/vitamin-c.jpg" />
<meta name="twitter:image:alt" content="Vitamin C 500 mg" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://mci-store.com/products/77#product",
  "name": "Vitamin C 500 mg",
  "description": "Vitamin C 500 mg untuk dukungan kesehatan harian dari MCI Store.",
  "url": "https://mci-store.com/products/77",
  "image": ["https://mci-store.com/manus-storage/vitamin-c.jpg"],
  "category": "Vitamins",
  "brand": {
    "@type": "Brand",
    "name": "MCI Store"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://mci-store.com/products/77",
    "price": "125000",
    "priceCurrency": "IDR",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "MCI Store",
      "url": "https://mci-store.com"
    }
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mci-store.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://mci-store.com/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Vitamin C 500 mg",
      "item": "https://mci-store.com/products/77"
    }
  ]
}
</script>
```

## 6. Rekomendasi penting untuk produksi

1. Gunakan URL gambar absolut dan dapat diakses publik.
2. Pastikan gambar utama minimal memiliki ukuran yang baik untuk social preview, misalnya 1200 × 630 piksel untuk gambar OG khusus.
3. Jangan menambahkan `aggregateRating` atau `review` tanpa review nyata.
4. Jangan menambahkan klaim medis yang tidak didukung pada `description`.
5. Pertahankan domain canonical, sitemap, Open Graph, dan Product schema pada domain utama `https://mci-store.com`.
6. Untuk SEO Google yang lebih kuat, metadata produk sebaiknya juga disisipkan server-side sebelum React hydration. Dynamic client-side metadata tetap berguna untuk browser, tetapi server-rendered HTML lebih aman untuk crawler.
7. Validasi hasil menggunakan [Google Rich Results Test](https://search.google.com/test/rich-results) dan [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

## 7. Contoh hasil JSON-LD ringkas

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Vitamin C 500 mg",
  "description": "Vitamin C 500 mg untuk dukungan kesehatan harian dari MCI Store.",
  "image": [
    "https://mci-store.com/manus-storage/vitamin-c.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "price": "125000",
    "priceCurrency": "IDR",
    "availability": "https://schema.org/InStock"
  }
}
```

Contoh ini dapat diadaptasi langsung ke helper `shared/productMetadata.ts` dan `shared/productSchema.ts` yang sudah ada di MCI Store.
