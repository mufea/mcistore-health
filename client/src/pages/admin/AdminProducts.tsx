import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { History, ImagePlus, Leaf, Loader2, Plus, Search, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";
import AdminProductEditButton from "@/components/AdminProductEditButton";

const CATEGORIES = ["Supplement", "Necklace", "Bracelet", "Watch", "Skincare", "Essential Oil", "Herbal Tea", "Vitamin", "Other"];
const SEGMENTS = ["all", "standard", "premium", "vip"];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const MAX_IMAGES = 6;

type ImageEntry = { url: string; key: string; isUploading?: boolean; localPreview?: string };

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.adminList.useQuery();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ id: number; name: string } | null>(null);
  const { data: stockHistory, isLoading: isLoadingHistory } = trpc.products.stockHistory.useQuery(
    { productId: historyTarget?.id ?? 1 },
    { enabled: Boolean(historyTarget) }
  );

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Supplement");
  const [targetSegment, setTargetSegment] = useState("all");
  const [stock, setStock] = useState("100");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Multi-image state
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [isUploadingAny, setIsUploadingAny] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = trpc.products.uploadImage.useMutation();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); setDialog(false); toast.success("Product created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); utils.products.stockHistory.invalidate(); setDialog(false); toast.success("Product updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); toast.success("Product deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setName(""); setDescription(""); setPrice(""); setCategory("Supplement");
    setTargetSegment("all"); setStock("100"); setIsFeatured(false); setIsActive(true);
    setImages([]);
    setDialog(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setName(p.name); setDescription(p.description ?? ""); setPrice(String(p.price));
    setCategory(p.category); setTargetSegment(p.targetSegment); setStock(String(p.stock));
    setIsFeatured(p.isFeatured); setIsActive(p.isActive);
    // Load existing images: prefer images array, fall back to single imageUrl
    if (p.images && p.images.length > 0) {
      setImages(p.images.map((img: any) => ({ url: img.url, key: img.key })));
    } else if (p.imageUrl) {
      setImages([{ url: p.imageUrl, key: p.imageKey ?? "" }]);
    } else {
      setImages([]);
    }
    setDialog(true);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.filter((i) => !i.isUploading).length;
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.warning(`Only ${remaining} more image(s) can be added (max ${MAX_IMAGES})`);
    }

    for (const file of toUpload) {
      if (file.size > MAX_FILE_SIZE) { toast.error(`${file.name} is too large (max 4 MB)`); continue; }
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} is not an image`); continue; }

      // Add placeholder with local preview
      const localPreview = URL.createObjectURL(file);
      const placeholder: ImageEntry = { url: "", key: "", isUploading: true, localPreview };
      setImages((prev) => [...prev, placeholder]);
      setIsUploadingAny(true);

      try {
        const base64 = await fileToBase64(file);
        const result = await uploadImageMutation.mutateAsync({ base64, filename: file.name, mimeType: file.type });
        setImages((prev) =>
          prev.map((img) =>
            img.localPreview === localPreview ? { url: result.url, key: result.key, localPreview } : img
          )
        );
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err?.message ?? "Unknown error"}`);
        setImages((prev) => prev.filter((img) => img.localPreview !== localPreview));
      } finally {
        setIsUploadingAny(false);
      }
    }

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const setMainImage = (idx: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [main] = next.splice(idx, 1);
      return [main, ...next];
    });
  };

  const save = () => {
    if (!name.trim() || !price) return toast.error("Name and price are required");
    const readyImages = images.filter((i) => !i.isUploading && i.url);
    const primaryImage = readyImages[0];
    const data = {
      name, description, price, category,
      targetSegment: targetSegment as any,
      stock: parseInt(stock),
      imageUrl: primaryImage?.url,
      imageKey: primaryImage?.key,
      images: readyImages.map(({ url, key }) => ({ url, key })),
      isFeatured, isActive,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = (products ?? []).filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const segmentColor: Record<string, string> = {
    all: "bg-green-100 text-green-700",
    standard: "bg-blue-100 text-blue-700",
    premium: "bg-amber-100 text-amber-700",
    vip: "bg-purple-100 text-purple-700",
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground mb-1">Products</h1>
          <p className="text-muted-foreground text-sm">Manage your product catalog</p>
        </div>
        <Button className="bg-primary text-primary-foreground gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <p className="text-muted-foreground mb-4">No products found.</p>
          <Button className="bg-primary text-primary-foreground gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Segment</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock</th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((product) => {
                const allImages = (product as any).images as { url: string; key: string }[] | undefined;
                const thumbUrl = allImages?.[0]?.url ?? product.imageUrl;
                return (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Leaf className="h-4 w-4 text-muted-foreground" />
                          )}
                          {allImages && allImages.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                              {allImages.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          {product.isFeatured && <Badge variant="secondary" className="text-xs mt-0.5">Featured</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-sm text-muted-foreground">{product.category}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${segmentColor[product.targetSegment] ?? ""}`}>
                        {product.targetSegment}
                      </span>
                    </td>
                    <td className="p-4"><span className="text-sm font-medium">IDR {Number(product.price).toLocaleString("id-ID")}</span></td>
                    <td className="p-4">
                      <span className={`text-sm ${product.stock === 0 ? "text-destructive" : "text-foreground"}`}>{product.stock}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setHistoryTarget({ id: product.id, name: product.name })} title="View stock history" aria-label={`View stock history for ${product.name}`}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <AdminProductEditButton productName={product.name} onEdit={() => openEdit(product)} />
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ id: product.id, name: product.name })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={dialog} onOpenChange={(open) => setDialog(open)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Product Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Omega-3 Supplement" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Price (IDR) *</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 250000" min={0} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Stock</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min={0} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Target Segment</Label>
                <Select value={targetSegment} onValueChange={setTargetSegment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEGMENTS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Multi-image upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-medium">Product Images</Label>
                <span className="text-xs text-muted-foreground">{images.filter((i) => !i.isUploading).length}/{MAX_IMAGES} images</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">First image is the main display image. Click ★ to set as main. PNG/JPG/WEBP up to 4 MB each.</p>

              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border/60 bg-muted/30">
                    <img
                      src={img.localPreview ?? img.url}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {img.isUploading && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                    {!img.isUploading && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMainImage(idx)}
                            className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                            title="Set as main image"
                          >
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    )}
                    {idx === 0 && !img.isUploading && (
                      <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        MAIN
                      </div>
                    )}
                  </div>
                ))}

                {/* Add more button */}
                {images.filter((i) => !i.isUploading).length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAny}
                    className="aspect-square rounded-lg border-2 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingAny ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-[10px]">Add photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Featured Product</Label>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Active (visible to customers)</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={save}
              disabled={isSaving || isUploadingAny}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock History */}
      <Dialog open={!!historyTarget} onOpenChange={(open) => { if (!open) setHistoryTarget(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Stock History — {historyTarget?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">A record of manual stock adjustments and inventory fulfilled through paid orders.</p>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !stockHistory?.length ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No stock changes have been recorded for this product yet.
            </div>
          ) : (
            <div className="max-h-[55vh] overflow-auto rounded-lg border border-border/60">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur">
                  <tr className="border-b border-border/60">
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date & Time</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stock</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</th>
                    <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Updated By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {stockHistory.map((entry) => {
                    const increased = entry.change > 0;
                    const source = entry.reason === "admin_adjustment" ? "Admin adjustment" : `Order #${entry.orderId ?? "—"}`;
                    return (
                      <tr key={entry.id} className="hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</td>
                        <td className="p-3"><span className={`font-semibold ${increased ? "text-emerald-700" : "text-destructive"}`}>{increased ? "+" : ""}{entry.change}</span></td>
                        <td className="p-3"><span className="font-medium">{entry.previousStock}</span><span className="mx-1 text-muted-foreground">→</span><span className="font-semibold">{entry.newStock}</span></td>
                        <td className="p-3"><Badge variant="outline" className="font-normal">{source}</Badge></td>
                        <td className="p-3 text-muted-foreground">{entry.changedByName ?? "System"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) { deleteMutation.mutate({ id: deleteTarget.id }); setDeleteTarget(null); } }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
