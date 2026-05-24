import { useState } from "react";
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
import { Edit, Leaf, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";

const CATEGORIES = ["Supplement", "Necklace", "Bracelet", "Watch", "Skincare", "Essential Oil", "Herbal Tea", "Vitamin", "Other"];
const SEGMENTS = ["all", "standard", "premium", "vip"];

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.adminList.useQuery();
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Supplement");
  const [targetSegment, setTargetSegment] = useState("all");
  const [stock, setStock] = useState("100");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); setDialog(false); toast.success("Product created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); setDialog(false); toast.success("Product updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.adminList.invalidate(); toast.success("Product deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setName(""); setDescription(""); setPrice(""); setCategory("Supplement");
    setTargetSegment("all"); setStock("100"); setImageUrl(""); setIsFeatured(false); setIsActive(true);
    setDialog(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setName(p.name); setDescription(p.description ?? ""); setPrice(String(p.price));
    setCategory(p.category); setTargetSegment(p.targetSegment); setStock(String(p.stock));
    setImageUrl(p.imageUrl ?? ""); setIsFeatured(p.isFeatured); setIsActive(p.isActive);
    setDialog(true);
  };

  const save = () => {
    if (!name.trim() || !price) return toast.error("Name and price are required");
    const data = {
      name, description, price: price, category,
      targetSegment: targetSegment as any, stock: parseInt(stock), imageUrl: imageUrl || undefined,
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
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Leaf className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        {product.isFeatured && <Badge variant="secondary" className="text-xs mt-0.5">Featured</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{product.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${segmentColor[product.targetSegment] ?? ""}`}>
                      {product.targetSegment}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">IDR {Number(product.price).toLocaleString("id-ID")}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${product.stock === 0 ? "text-destructive" : "text-foreground"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(product)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
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
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Image URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
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
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
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
