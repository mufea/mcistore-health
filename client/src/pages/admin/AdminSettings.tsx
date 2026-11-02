import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Building2, Globe, ImagePlus, Loader2, Package, PlugZap, Plus, Save, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";
import { getYouTubeEmbedUrl, isYouTubeUrl } from "@shared/youtube";
import { DEFAULT_BUSINESS_OPPORTUNITY_SLIDES, parseBusinessOpportunitySlides, serializeBusinessOpportunitySlides, type BusinessOpportunitySlide } from "@shared/businessPromotion";

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: rawSettings, isLoading } = trpc.settings.adminGetAll.useQuery();

  // Site
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [businessSlides, setBusinessSlides] = useState<BusinessOpportunitySlide[]>(DEFAULT_BUSINESS_OPPORTUNITY_SLIDES);
  const [promotionVideoUrl, setPromotionVideoUrl] = useState("");

  // Bank Transfer
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [beneficiary, setBeneficiary] = useState("");

  // Shipping
  const [nationalCost, setNationalCost] = useState("");
  const [internationalCost, setInternationalCost] = useState("");

  // Midtrans
  const [midtransMerchantId, setMidtransMerchantId] = useState("");
  const [midtransServerKey, setMidtransServerKey] = useState("");
  const [midtransClientKey, setMidtransClientKey] = useState("");
  const [midtransIsProduction, setMidtransIsProduction] = useState(false);

  useEffect(() => {
    if (rawSettings) {
      setSiteName(rawSettings["site_name"] ?? "VitaWell Health");
      setSiteTagline(rawSettings["site_tagline"] ?? "");
      setBusinessSlides(parseBusinessOpportunitySlides(rawSettings["business_opportunity_slides"]));
      setPromotionVideoUrl(rawSettings["promotion_video_url"] ?? "");
      setBankName(rawSettings["bank_transfer_bank_name"] ?? "");
      setAccountNumber(rawSettings["bank_transfer_account_number"] ?? "");
      setBeneficiary(rawSettings["bank_transfer_beneficiary"] ?? "");
      setNationalCost(rawSettings["shipping_national_cost"] ?? "50000");
      setInternationalCost(rawSettings["shipping_international_cost"] ?? "250000");
      setMidtransMerchantId(rawSettings["midtrans_merchant_id"] ?? "");
      setMidtransServerKey(rawSettings["midtrans_server_key"] ?? "");
      setMidtransClientKey(rawSettings["midtrans_client_key"] ?? "");
      setMidtransIsProduction(rawSettings["midtrans_is_production"] === "true");
    }
  }, [rawSettings]);

  const updateMutation = trpc.settings.bulkUpdate.useMutation({
    onSuccess: () => { utils.settings.adminGetAll.invalidate(); utils.settings.getPublic.invalidate(); toast.success("Settings saved successfully"); },
    onError: (e) => toast.error(e.message),
  });

  const uploadImageMutation = trpc.products.uploadImage.useMutation();

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handlePromotionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number, field: "full" | "mobile") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be 4 MB or smaller");
      return;
    }
    try {
      const result = await uploadImageMutation.mutateAsync({ base64: await fileToBase64(file), filename: `business-opportunity-${Date.now()}-${field}-${file.name}`, mimeType: file.type });
      setBusinessSlides((slides) => slides.map((slide, slideIndex) => slideIndex === index ? { ...slide, [field]: result.url } : slide));
      toast.success("Carousel image uploaded");
    } catch (error: any) {
      toast.error(error?.message ?? "Image upload failed");
    }
  };

  const testMidtransMutation = trpc.payment.testMidtransConnection.useMutation({
    onSuccess: (result) => {
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    },
    onError: (error) => toast.error(error.message),
  });

  const save = () => {
    if (promotionVideoUrl.trim() && !isYouTubeUrl(promotionVideoUrl)) {
      toast.error("Promotion video URL must be a valid YouTube link");
      return;
    }
    updateMutation.mutate({
      settings: {
        site_name: siteName,
        site_tagline: siteTagline,
        bank_transfer_bank_name: bankName,
        bank_transfer_account_number: accountNumber,
        bank_transfer_beneficiary: beneficiary,
        shipping_national_cost: nationalCost,
        shipping_international_cost: internationalCost,
        midtrans_merchant_id: midtransMerchantId,
        midtrans_server_key: midtransServerKey,
        midtrans_client_key: midtransClientKey,
        midtrans_is_production: String(midtransIsProduction),
        business_opportunity_slides: serializeBusinessOpportunitySlides(businessSlides),
        promotion_video_url: promotionVideoUrl.trim(),
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Configure payment, shipping, and site settings</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground gap-2"
          onClick={save}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Settings
        </Button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Site Settings */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Site Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Site Name</Label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="VitaWell Health" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Site Tagline</Label>
              <Input value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} placeholder="Your journey to optimal health starts here." />
            </div>
          </div>
        </div>

        {/* Homepage promotions */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ImagePlus className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Homepage Promotions</h2>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">Manage the Business Opportunity carousel images and the promotional video shown on the homepage.</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-medium">Business Opportunity Carousel</Label>
                <p className="mt-1 text-xs text-muted-foreground">Use a full-size image and optionally a smaller mobile image for each slide.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={() => setBusinessSlides((slides) => [...slides, { full: "" }])}>
                <Plus className="h-4 w-4" /> Add slide
              </Button>
            </div>

            <div className="space-y-3">
              {businessSlides.map((slide, index) => (
                <div key={`${index}-${slide.full}`} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Slide {index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive" disabled={businessSlides.length <= 1} onClick={() => setBusinessSlides((slides) => slides.filter((_, slideIndex) => slideIndex !== index))}>
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium">Full-size image URL</Label>
                      <Input value={slide.full} onChange={(event) => setBusinessSlides((slides) => slides.map((item, slideIndex) => slideIndex === index ? { ...item, full: event.target.value } : item))} placeholder="https://... or /manus-storage/..." />
                      <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                        <ImagePlus className="h-3.5 w-3.5" /> Upload full-size image
                        <input type="file" accept="image/*" className="sr-only" onChange={(event) => handlePromotionImageUpload(event, index, "full")} />
                      </label>
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs font-medium">Mobile image URL (optional)</Label>
                      <Input value={slide.mobile ?? ""} onChange={(event) => setBusinessSlides((slides) => slides.map((item, slideIndex) => slideIndex === index ? { ...item, mobile: event.target.value || undefined } : item))} placeholder="Optional 480px image URL" />
                      <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                        <ImagePlus className="h-3.5 w-3.5" /> Upload mobile image
                        <input type="file" accept="image/*" className="sr-only" onChange={(event) => handlePromotionImageUpload(event, index, "mobile")} />
                      </label>
                    </div>
                  </div>
                  {slide.full && <img src={slide.full} alt={`Business Opportunity slide ${index + 1} preview`} className="mt-3 h-28 w-20 rounded-md border border-border/60 object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
                </div>
              ))}
            </div>

            <Separator />
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Promotion Video YouTube URL</Label>
              <Input value={promotionVideoUrl} onChange={(event) => setPromotionVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              <p className="mt-1 text-xs text-muted-foreground">Leave empty to show a coming-soon message. Only valid YouTube links are accepted.</p>
              {promotionVideoUrl.trim() && !isYouTubeUrl(promotionVideoUrl) && <p className="mt-1 text-xs text-destructive">Enter a valid YouTube URL.</p>}
              {getYouTubeEmbedUrl(promotionVideoUrl) && <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border/60"><iframe src={getYouTubeEmbedUrl(promotionVideoUrl) ?? undefined} title="Promotion video preview" className="h-full w-full" /></div>}
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Bank Transfer Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Bank Name</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. BCA, Mandiri, BNI" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Account Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g. 1234567890" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Beneficiary Name</Label>
              <Input value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="e.g. PT VitaWell Indonesia" />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Shipping Rates</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Set flat-rate shipping costs for national and international deliveries.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">National Shipping (IDR)</Label>
              <Input type="number" value={nationalCost} onChange={(e) => setNationalCost(e.target.value)} placeholder="50000" min={0} />
              <p className="text-xs text-muted-foreground mt-1">Delivery within Indonesia</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">International Shipping (IDR)</Label>
              <Input type="number" value={internationalCost} onChange={(e) => setInternationalCost(e.target.value)} placeholder="250000" min={0} />
              <p className="text-xs text-muted-foreground mt-1">Worldwide delivery</p>
            </div>
          </div>
        </div>

        {/* Midtrans */}
        <div className="bg-card rounded-xl border border-border/60 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Midtrans Payment Gateway</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Merchant ID</Label>
              <Input
                value={midtransMerchantId}
                onChange={(e) => setMidtransMerchantId(e.target.value)}
                placeholder="e.g. G123456789"
              />
              <p className="text-xs text-muted-foreground mt-1">Your Midtrans Merchant ID found in the Midtrans Dashboard.</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Server Key</Label>
              <Input
                type="password"
                value={midtransServerKey}
                onChange={(e) => setMidtransServerKey(e.target.value)}
                placeholder="SB-Mid-server-..."
              />
              <p className="text-xs text-muted-foreground mt-1">Used server-side for creating transactions. Keep this secret.</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Client Key</Label>
              <Input
                value={midtransClientKey}
                onChange={(e) => setMidtransClientKey(e.target.value)}
                placeholder="SB-Mid-client-..."
              />
              <p className="text-xs text-muted-foreground mt-1">Used client-side for Snap.js integration.</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Production Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {midtransIsProduction ? "Using production Midtrans endpoints" : "Using sandbox/testing endpoints"}
                </p>
              </div>
              <Switch checked={midtransIsProduction} onCheckedChange={setMidtransIsProduction} />
            </div>
            {!midtransIsProduction && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <strong>Sandbox Mode:</strong> Payments are simulated. Switch to Production Mode when ready to accept real payments.
                </p>
              </div>
            )}
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Test Midtrans Connection</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Save your Midtrans credentials first. The test makes a read-only API request and does not create a transaction.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full gap-2 sm:mt-0 sm:w-auto"
                onClick={() => testMidtransMutation.mutate()}
                disabled={testMidtransMutation.isPending || updateMutation.isPending}
              >
                {testMidtransMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
                {testMidtransMutation.isPending ? "Testing Connection…" : "Test Connection"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="bg-primary text-primary-foreground gap-2 px-8"
            onClick={save}
            disabled={updateMutation.isPending}
            size="lg"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
