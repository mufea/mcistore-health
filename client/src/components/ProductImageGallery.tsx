import { useState } from "react";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";

interface ImageItem {
  url: string;
  key: string;
}

interface ProductImageGalleryProps {
  /** Primary image URL (legacy single-image field) */
  imageUrl?: string | null;
  /** Multi-image array from the new images column */
  images?: ImageItem[] | null;
  productName: string;
  /** "card" = compact carousel for product listing cards */
  /** "detail" = large view with thumbnail strip below */
  mode?: "card" | "detail";
  className?: string;
}

export default function ProductImageGallery({
  imageUrl,
  images,
  productName,
  mode = "card",
  className = "",
}: ProductImageGalleryProps) {
  // Build a unified list: images array first, then fall back to single imageUrl
  const allImages: string[] = (() => {
    const arr: string[] = [];
    if (images && images.length > 0) {
      images.forEach((img) => arr.push(img.url));
    } else if (imageUrl) {
      arr.push(imageUrl);
    }
    return arr;
  })();

  const [current, setCurrent] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));
  };

  if (allImages.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted/30 ${className}`}>
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="h-7 w-7 text-primary/40" />
        </div>
      </div>
    );
  }

  if (mode === "card") {
    return (
      <div className={`relative overflow-hidden bg-muted/30 group/gallery ${className}`}>
        {/* Main image */}
        <img
          src={allImages[current]}
          alt={`${productName} ${current + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Prev/Next arrows — only show when multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-200 hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-200 hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    i === current ? "bg-white scale-125" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Detail mode — large image + thumbnail strip
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main large image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/30">
        <img
          src={allImages[current]}
          alt={`${productName} ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-200"
        />
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Counter badge */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {current + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === current
                  ? "border-primary shadow-sm scale-105"
                  : "border-border/40 opacity-60 hover:opacity-100 hover:border-border"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img src={url} alt={`${productName} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
