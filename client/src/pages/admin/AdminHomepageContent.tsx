import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";
import { getYouTubeEmbedUrl, isYouTubeUrl } from "@shared/youtube";
import { DEFAULT_BUSINESS_OPPORTUNITY_SLIDES, parseBusinessOpportunitySlides, reorderBusinessOpportunitySlides, serializeBusinessOpportunitySlides, type BusinessOpportunitySlide } from "@shared/businessPromotion";
import { DEFAULT_TRANSDERMAL_NUTRITION, parseTransdermalNutrition, serializeTransdermalNutrition, TRANSDERMAL_LANGUAGES, type TransdermalLanguage, type TransdermalNutritionContent } from "@shared/transdermalNutrition";

export default function AdminHomepageContent() {
  const utils = trpc.useUtils();
  const { data: rawSettings, isLoading } = trpc.settings.adminGetAll.useQuery();
  const [businessSlides, setBusinessSlides] = useState<BusinessOpportunitySlide[]>(DEFAULT_BUSINESS_OPPORTUNITY_SLIDES);
  const [promotionVideoUrl, setPromotionVideoUrl] = useState("");
  const [transdermalNutrition, setTransdermalNutrition] = useState<TransdermalNutritionContent>(DEFAULT_TRANSDERMAL_NUTRITION);
  const [nutritionLanguage, setNutritionLanguage] = useState<TransdermalLanguage>("en");
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [dragOverSlideIndex, setDragOverSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!rawSettings) return;
    setBusinessSlides(parseBusinessOpportunitySlides(rawSettings["business_opportunity_slides"]));
    setPromotionVideoUrl(rawSettings["promotion_video_url"] ?? "");
    setTransdermalNutrition(parseTransdermalNutrition(rawSettings["transdermal_nutrition"]));
  }, [rawSettings]);

  const updateMutation = trpc.settings.bulkUpdate.useMutation({
    onSuccess: () => { utils.settings.adminGetAll.invalidate(); utils.settings.getPublic.invalidate(); toast.success("Homepage content saved successfully"); },
    onError: (error) => toast.error(error.message),
  });
  const uploadImageMutation = trpc.products.uploadImage.useMutation();

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handlePromotionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number, field: "full" | "mobile") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("Image must be 4 MB or smaller"); return; }
    try {
      const result = await uploadImageMutation.mutateAsync({ base64: await fileToBase64(file), filename: `business-opportunity-${Date.now()}-${field}-${file.name}`, mimeType: file.type });
      setBusinessSlides((slides) => slides.map((slide, slideIndex) => slideIndex === index ? { ...slide, [field]: result.url } : slide));
      toast.success("Carousel image uploaded");
    } catch (error: any) { toast.error(error?.message ?? "Image upload failed"); }
  };

  const handleNutritionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("Image must be 4 MB or smaller"); return; }
    try {
      const result = await uploadImageMutation.mutateAsync({ base64: await fileToBase64(file), filename: `transdermal-nutrition-${Date.now()}-${file.name}`, mimeType: file.type });
      setTransdermalNutrition((content) => ({
        ...content,
        images: [...content.images, { url: result.url, alt: Object.fromEntries(TRANSDERMAL_LANGUAGES.map((language) => [language, "Transdermal patch nutrition illustration"])) as Record<TransdermalLanguage, string> }].slice(0, 6),
      }));
      toast.success("Gallery image uploaded");
    } catch (error: any) { toast.error(error?.message ?? "Image upload failed"); }
  };

  const handleSlideDrop = (targetIndex: number) => {
    if (draggedSlideIndex === null || draggedSlideIndex === targetIndex) { setDraggedSlideIndex(null); setDragOverSlideIndex(null); return; }
    setBusinessSlides((slides) => reorderBusinessOpportunitySlides(slides, draggedSlideIndex, targetIndex));
    setDraggedSlideIndex(null);
    setDragOverSlideIndex(null);
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= businessSlides.length) return;
    setBusinessSlides((slides) => {
      const next = [...slides];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const save = () => {
    if (promotionVideoUrl.trim() && !isYouTubeUrl(promotionVideoUrl)) {
      toast.error("Promotion video URL must be a valid YouTube link");
      return;
    }
    updateMutation.mutate({ settings: {
      business_opportunity_slides: serializeBusinessOpportunitySlides(businessSlides),
      promotion_video_url: promotionVideoUrl.trim(),
      transdermal_nutrition: serializeTransdermalNutrition(transdermalNutrition),
    } });
  };

  if (isLoading) return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 font-serif text-3xl font-light text-foreground">Homepage Content</h1>
          <p className="text-sm text-muted-foreground">Manage promotional media and the Transdermal Patch Nutrition section.</p>
        </div>
        <Button className="shrink-0 gap-2 bg-primary text-primary-foreground" onClick={save} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Content
        </Button>
      </div>

      <div className="max-w-3xl space-y-6">
        <section className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-2 flex items-center gap-2"><ImagePlus className="h-4 w-4 text-primary" /><h2 className="font-semibold text-foreground">Homepage Promotions</h2></div>
          <p className="mb-5 text-sm text-muted-foreground">Manage the Business Opportunity carousel and promotional video shown on the homepage.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3"><div><Label className="text-sm font-medium">Business Opportunity Carousel</Label><p className="mt-1 text-xs text-muted-foreground">Drag to reorder slides, or use the arrow buttons on touch devices.</p></div><Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={() => setBusinessSlides((slides) => [...slides, { full: "" }])}><Plus className="h-4 w-4" /> Add slide</Button></div>
            <div className="space-y-3">
              {businessSlides.map((slide, index) => (
                <div key={`${index}-${slide.full}`} onDragOver={(event) => { event.preventDefault(); setDragOverSlideIndex(index); }} onDragEnter={() => setDragOverSlideIndex(index)} onDragLeave={() => setDragOverSlideIndex(null)} onDrop={() => handleSlideDrop(index)} className={`rounded-lg border bg-muted/20 p-3 transition-[opacity,box-shadow,border-color] ${draggedSlideIndex === index ? "opacity-50" : ""} ${dragOverSlideIndex === index && draggedSlideIndex !== index ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border/60"}`}>
                  <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><button type="button" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; setDraggedSlideIndex(index); setDragOverSlideIndex(null); }} onDragEnd={() => { setDraggedSlideIndex(null); setDragOverSlideIndex(null); }} className="cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing" aria-label={`Drag slide ${index + 1} to reorder`} title="Drag to reorder"><GripVertical className="h-5 w-5" /></button><p className="text-sm font-medium">Slide {index + 1}</p><span className="hidden text-xs text-muted-foreground sm:inline">Drag onto another slide to move</span></div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => moveSlide(index, -1)} aria-label={`Move slide ${index + 1} up`}><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === businessSlides.length - 1} onClick={() => moveSlide(index, 1)} aria-label={`Move slide ${index + 1} down`}><ArrowDown className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive" disabled={businessSlides.length <= 1} onClick={() => setBusinessSlides((slides) => slides.filter((_, slideIndex) => slideIndex !== index))}><Trash2 className="h-4 w-4" /> Remove</Button></div></div>
                  <div className="grid gap-3 sm:grid-cols-2"><div><Label className="mb-1.5 block text-xs font-medium">Full-size image URL</Label><Input value={slide.full} onChange={(event) => setBusinessSlides((slides) => slides.map((item, slideIndex) => slideIndex === index ? { ...item, full: event.target.value } : item))} placeholder="https://... or /manus-storage/..." /><label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline"><ImagePlus className="h-3.5 w-3.5" /> Upload full-size image<input type="file" accept="image/*" className="sr-only" onChange={(event) => handlePromotionImageUpload(event, index, "full")} /></label></div><div><Label className="mb-1.5 block text-xs font-medium">Mobile image URL (optional)</Label><Input value={slide.mobile ?? ""} onChange={(event) => setBusinessSlides((slides) => slides.map((item, slideIndex) => slideIndex === index ? { ...item, mobile: event.target.value || undefined } : item))} placeholder="Optional 480px image URL" /><label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline"><ImagePlus className="h-3.5 w-3.5" /> Upload mobile image<input type="file" accept="image/*" className="sr-only" onChange={(event) => handlePromotionImageUpload(event, index, "mobile")} /></label></div></div>
                  {slide.full && <img src={slide.full} alt={`Business Opportunity slide ${index + 1} preview`} className="mt-3 h-28 w-20 rounded-md border border-border/60 object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
                </div>
              ))}
            </div>
            <Separator />
            <div><Label className="mb-1.5 block text-sm font-medium">Promotion Video YouTube URL</Label><Input value={promotionVideoUrl} onChange={(event) => setPromotionVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." /><p className="mt-1 text-xs text-muted-foreground">Leave empty to show a coming-soon message. Only valid YouTube links are accepted.</p>{promotionVideoUrl.trim() && !isYouTubeUrl(promotionVideoUrl) && <p className="mt-1 text-xs text-destructive">Enter a valid YouTube URL.</p>}{getYouTubeEmbedUrl(promotionVideoUrl) && <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border/60"><iframe src={getYouTubeEmbedUrl(promotionVideoUrl) ?? undefined} title="Promotion video preview" className="h-full w-full" /></div>}</div>
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-6">
          <div className="mb-2 flex items-center justify-between gap-3"><div><h2 className="font-semibold text-foreground">Transdermal Patch Nutrition</h2><p className="mt-1 text-sm text-muted-foreground">Control the nutrition-use section shown on the homepage.</p></div><Switch checked={transdermalNutrition.enabled} onCheckedChange={(enabled) => setTransdermalNutrition((content) => ({ ...content, enabled }))} aria-label="Show transdermal nutrition section" /></div>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3"><div className="flex items-center justify-between gap-3"><div><Label className="text-sm font-medium">Image gallery</Label><p className="mt-1 text-xs text-muted-foreground">Add up to six images. The first image is displayed larger on the homepage.</p></div><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-primary hover:bg-muted"><ImagePlus className="h-3.5 w-3.5" /> Upload image<input type="file" accept="image/*" className="sr-only" onChange={handleNutritionImageUpload} disabled={transdermalNutrition.images.length >= 6} /></label></div><div className="mt-3 space-y-3">{transdermalNutrition.images.map((image, index) => <div key={`${index}-${image.url}`} className="rounded-lg border border-border/60 bg-background p-3"><div className="flex items-start gap-3"><img src={image.url} alt={image.alt[nutritionLanguage] ?? "Gallery preview"} className="h-20 w-16 shrink-0 rounded-md border border-border/60 object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div className="min-w-0 flex-1"><Label className="mb-1.5 block text-xs font-medium">Image {index + 1} URL</Label><Input value={image.url} onChange={(event) => setTransdermalNutrition((content) => ({ ...content, images: content.images.map((entry, imageIndex) => imageIndex === index ? { ...entry, url: event.target.value } : entry) }))} placeholder="https://... or /manus-storage/..." /><Input value={image.alt[nutritionLanguage]} onChange={(event) => setTransdermalNutrition((content) => ({ ...content, images: content.images.map((entry, imageIndex) => imageIndex === index ? { ...entry, alt: { ...entry.alt, [nutritionLanguage]: event.target.value } } : entry) }))} maxLength={180} className="mt-2" placeholder={`Alt text in ${nutritionLanguage}`} /></div><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={transdermalNutrition.images.length <= 1} onClick={() => setTransdermalNutrition((content) => ({ ...content, images: content.images.filter((_, imageIndex) => imageIndex !== index) }))} aria-label={`Remove image ${index + 1}`}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div><p className="mt-2 text-xs text-muted-foreground">Image alt text is edited for the selected language below.</p></div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3"><Label className="mb-1.5 block text-sm font-medium">Edit language</Label><select value={nutritionLanguage} onChange={(event) => setNutritionLanguage(event.target.value as TransdermalLanguage)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{TRANSDERMAL_LANGUAGES.map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}</select></div>
            <NutritionLocaleFields language={nutritionLanguage} content={transdermalNutrition} setContent={setTransdermalNutrition} />
            <Separator />
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3"><div className="flex items-center justify-between gap-3"><div><Label className="text-sm font-medium">WhatsApp / consultation CTA</Label><p className="mt-1 text-xs text-muted-foreground">Use an https://, tel:, or mailto: link. Leave empty to open the site chatbot for consultation.</p></div><Switch checked={transdermalNutrition.contact.enabled} onCheckedChange={(enabled) => setTransdermalNutrition((content) => ({ ...content, contact: { ...content.contact, enabled } }))} aria-label="Show consultation button" /></div><Input value={transdermalNutrition.contact.url} onChange={(event) => setTransdermalNutrition((content) => ({ ...content, contact: { ...content.contact, url: event.target.value } }))} className="mt-3" placeholder="https://wa.me/628..." /><Input value={transdermalNutrition.contact.label[nutritionLanguage]} onChange={(event) => setTransdermalNutrition((content) => ({ ...content, contact: { ...content.contact, label: { ...content.contact.label, [nutritionLanguage]: event.target.value } } }))} maxLength={100} className="mt-2" placeholder={`Consultation button label in ${nutritionLanguage}`} /></div>
          </div>
        </section>

        <div className="flex justify-end"><Button className="gap-2 bg-primary px-8 text-primary-foreground" onClick={save} disabled={updateMutation.isPending} size="lg">{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Content</Button></div>
      </div>
    </AdminLayout>
  );
}

type NutritionLocaleFieldsProps = {
  language: TransdermalLanguage;
  content: TransdermalNutritionContent;
  setContent: React.Dispatch<React.SetStateAction<TransdermalNutritionContent>>;
};

function NutritionLocaleFields({ language, content, setContent }: NutritionLocaleFieldsProps) {
  const locale = content.content[language];
  const updateLocale = (patch: Partial<typeof locale>) => setContent((current) => ({ ...current, content: { ...current.content, [language]: { ...current.content[language], ...patch } } }));
  return <>
    <div><Label className="mb-1.5 block text-sm font-medium">Section eyebrow</Label><Input value={locale.eyebrow} onChange={(event) => updateLocale({ eyebrow: event.target.value })} maxLength={100} /></div>
    <div><Label className="mb-1.5 block text-sm font-medium">Section title</Label><Input value={locale.title} onChange={(event) => updateLocale({ title: event.target.value })} maxLength={180} /></div>
    <div><Label className="mb-1.5 block text-sm font-medium">Description</Label><textarea value={locale.description} onChange={(event) => updateLocale({ description: event.target.value })} maxLength={500} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
    <div className="space-y-3"><Label className="block text-sm font-medium">Three practical uses</Label>{locale.items.map((item, index) => <div key={index} className="rounded-lg border border-border/60 bg-muted/20 p-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Use {index + 1}</p><Input value={item.title} onChange={(event) => updateLocale({ items: locale.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry) as typeof locale.items })} maxLength={100} placeholder="Use title" /><Input value={item.description} onChange={(event) => updateLocale({ items: locale.items.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry) as typeof locale.items })} maxLength={300} className="mt-2" placeholder="Explain this use" /></div>)}</div>
    <div><Label className="mb-1.5 block text-sm font-medium">Safety note</Label><textarea value={locale.note} onChange={(event) => updateLocale({ note: event.target.value })} maxLength={400} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></div>
    <div><Label className="mb-1.5 block text-sm font-medium">Product CTA label</Label><Input value={locale.ctaLabel} onChange={(event) => updateLocale({ ctaLabel: event.target.value })} maxLength={100} /></div>
  </>;
}
