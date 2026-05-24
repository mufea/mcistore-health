import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  Loader2,
  Home,
  Tag,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AdminLayout } from "./AdminDashboard";

// ─── Knowledge categories ─────────────────────────────────────────────────────

const CATEGORIES = [
  "general",
  "products",
  "supplements",
  "accessories",
  "shipping",
  "payment",
  "health-tips",
  "company",
  "faq",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminKnowledge() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general",
    isActive: true,
  });

  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.chatbot.knowledge.list.useQuery();

  const createMutation = trpc.chatbot.knowledge.create.useMutation({
    onSuccess: () => {
      toast.success("Knowledge entry created");
      utils.chatbot.knowledge.list.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.chatbot.knowledge.update.useMutation({
    onSuccess: () => {
      toast.success("Knowledge entry updated");
      utils.chatbot.knowledge.list.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.chatbot.knowledge.delete.useMutation({
    onSuccess: () => {
      toast.success("Entry deleted");
      utils.chatbot.knowledge.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => {
    setForm({ title: "", content: "", category: "general", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (item: NonNullable<typeof items>[0]) => {
    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      isActive: item.isActive,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const filtered = (items ?? []).filter((item) => {
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Access restricted to administrators.</p>
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"><Home className="h-4 w-4" />Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Chatbot Knowledge Base</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Train the AI chatbot with product info, FAQs, and company knowledge. The chatbot uses this data to answer customer questions accurately.
            </p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Entries", value: items?.length ?? 0, icon: BookOpen },
            { label: "Active", value: items?.filter((i) => i.isActive).length ?? 0, icon: FileText },
            { label: "Categories", value: new Set(items?.map((i) => i.category)).size, icon: Tag },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border/60 rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c.replace("-", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border/60 rounded-xl">
            <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No knowledge entries found</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add entries to train the chatbot with product and company information
            </p>
            <Button className="mt-4" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border/60 rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                      <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs flex-shrink-0">
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs flex-shrink-0 capitalize">
                        {item.category.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleteTarget({ id: item.id, title: item.title });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Knowledge Entry" : "Add Knowledge Entry"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
              <Input
                placeholder="e.g. Omega-3 Supplement Benefits"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Content *</Label>
              <textarea
                className="w-full min-h-[200px] px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                placeholder="Enter detailed information about this topic. The chatbot will use this to answer customer questions accurately. Include product details, benefits, usage instructions, pricing info, or any other relevant information."
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be as detailed as possible. The AI uses this content verbatim to answer questions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label className="text-sm">Active (chatbot uses this entry)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingId ? "Save Changes" : "Create Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
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
