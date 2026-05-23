import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronUp, Edit, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";

type QuestionType = "single_choice" | "multiple_choice" | "text" | "scale";

export default function AdminSurvey() {
  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.survey.adminGetPages.useQuery();

  // Page dialog
  const [pageDialog, setPageDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageDesc, setPageDesc] = useState("");
  const [pageOrder, setPageOrder] = useState(0);

  // Question dialog
  const [questionDialog, setQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<QuestionType>("single_choice");
  const [qOptions, setQOptions] = useState<string[]>([""]);
  const [qRequired, setQRequired] = useState(true);
  const [qOrder, setQOrder] = useState(0);

  const createPageMutation = trpc.survey.createPage.useMutation({
    onSuccess: () => { utils.survey.adminGetPages.invalidate(); setPageDialog(false); toast.success("Page created"); },
    onError: (e) => toast.error(e.message),
  });
  const updatePageMutation = trpc.survey.updatePage.useMutation({
    onSuccess: () => { utils.survey.adminGetPages.invalidate(); setPageDialog(false); toast.success("Page updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deletePageMutation = trpc.survey.deletePage.useMutation({
    onSuccess: () => { utils.survey.adminGetPages.invalidate(); toast.success("Page deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const createQuestionMutation = trpc.survey.createQuestion.useMutation({
    onSuccess: () => { utils.survey.adminGetPages.invalidate(); setQuestionDialog(false); toast.success("Question created"); },
    onError: (e) => toast.error(e.message),
  });
  const updateQuestionMutation = trpc.survey.updateQuestion.useMutation({
    onSuccess: () => { utils.survey.adminGetPages.invalidate(); setQuestionDialog(false); toast.success("Question updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteQuestionMutation = trpc.survey.deleteQuestion.useMutation({
    onSuccess: () => { utils.survey.adminGetPages.invalidate(); toast.success("Question deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const openNewPage = () => {
    setEditingPage(null);
    setPageTitle(""); setPageDesc(""); setPageOrder(pages?.length ?? 0);
    setPageDialog(true);
  };

  const openEditPage = (page: any) => {
    setEditingPage(page);
    setPageTitle(page.title); setPageDesc(page.description ?? ""); setPageOrder(page.order);
    setPageDialog(true);
  };

  const savePage = () => {
    if (!pageTitle.trim()) return toast.error("Title is required");
    if (editingPage) {
      updatePageMutation.mutate({ id: editingPage.id, title: pageTitle, description: pageDesc, order: pageOrder });
    } else {
      createPageMutation.mutate({ title: pageTitle, description: pageDesc, order: pageOrder });
    }
  };

  const openNewQuestion = (pageId: number) => {
    setEditingQuestion(null);
    setSelectedPageId(pageId);
    setQText(""); setQType("single_choice"); setQOptions([""]); setQRequired(true); setQOrder(0);
    setQuestionDialog(true);
  };

  const openEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setSelectedPageId(q.pageId);
    setQText(q.text); setQType(q.type); setQOptions(q.options ?? [""]); setQRequired(q.isRequired); setQOrder(q.order);
    setQuestionDialog(true);
  };

  const saveQuestion = () => {
    if (!qText.trim()) return toast.error("Question text is required");
    const hasOptions = ["single_choice", "multiple_choice"].includes(qType);
    const options = hasOptions ? qOptions.filter((o) => o.trim()) : undefined;
    if (hasOptions && (!options || options.length === 0)) return toast.error("Add at least one option");

    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, text: qText, type: qType, options, isRequired: qRequired, order: qOrder });
    } else {
      if (!selectedPageId) return;
      createQuestionMutation.mutate({ pageId: selectedPageId, text: qText, type: qType, options, isRequired: qRequired, order: qOrder });
    }
  };

  const addOption = () => setQOptions((o) => [...o, ""]);
  const removeOption = (i: number) => setQOptions((o) => o.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => setQOptions((o) => o.map((v, idx) => idx === i ? val : v));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-foreground mb-1">Survey Manager</h1>
          <p className="text-muted-foreground text-sm">Manage health survey pages and questions</p>
        </div>
        <Button className="bg-primary text-primary-foreground gap-2" onClick={openNewPage}>
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !pages || pages.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60">
          <p className="text-muted-foreground mb-4">No survey pages yet. Create your first page to get started.</p>
          <Button className="bg-primary text-primary-foreground gap-2" onClick={openNewPage}>
            <Plus className="h-4 w-4" />
            Create First Page
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="bg-card rounded-xl border border-border/60 overflow-hidden">
              {/* Page header */}
              <div className="flex items-center justify-between p-5 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xs font-semibold">{page.order + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{page.title}</h3>
                      <Badge variant={page.isActive ? "default" : "secondary"} className="text-xs">
                        {page.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {page.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{page.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditPage(page)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this page and all its questions?")) {
                        deletePageMutation.mutate({ id: page.id });
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => openNewQuestion(page.id)}
                  >
                    <Plus className="h-3 w-3" />
                    Add Question
                  </Button>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-border/40">
                {(page as any).questions?.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-4 text-center">No questions yet. Add your first question.</p>
                ) : (
                  (page as any).questions?.map((q: any, qi: number) => (
                    <div key={q.id} className="flex items-start justify-between p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-muted-foreground mt-0.5 w-4">{qi + 1}.</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{q.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">{q.type.replace("_", " ")}</Badge>
                            {q.isRequired && <Badge variant="secondary" className="text-xs">Required</Badge>}
                            {!q.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                          </div>
                          {q.options && q.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {q.options.map((opt: string) => (
                                <span key={opt} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => openEditQuestion(q)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this question?")) {
                              deleteQuestionMutation.mutate({ id: q.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Page Dialog */}
      <Dialog open={pageDialog} onOpenChange={setPageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit Survey Page" : "New Survey Page"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Page Title *</Label>
              <Input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="e.g. General Health" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Description</Label>
              <Textarea value={pageDesc} onChange={(e) => setPageDesc(e.target.value)} placeholder="Brief description of this survey section..." rows={2} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Display Order</Label>
              <Input type="number" value={pageOrder} onChange={(e) => setPageOrder(Number(e.target.value))} min={0} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPageDialog(false)}>Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={savePage}
              disabled={createPageMutation.isPending || updatePageMutation.isPending}
            >
              {(createPageMutation.isPending || updatePageMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingPage ? "Save Changes" : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "New Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Question Text *</Label>
              <Textarea value={qText} onChange={(e) => setQText(e.target.value)} placeholder="Enter your question..." rows={2} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Question Type</Label>
              <Select value={qType} onValueChange={(v) => setQType(v as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">Single Choice</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="scale">Scale (1-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {["single_choice", "multiple_choice"].includes(qType) && (
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Answer Options</Label>
                <div className="space-y-2">
                  {qOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                      />
                      {qOptions.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => removeOption(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={addOption} className="gap-1.5 text-xs">
                    <Plus className="h-3 w-3" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Required Question</Label>
              <Switch checked={qRequired} onCheckedChange={setQRequired} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Display Order</Label>
              <Input type="number" value={qOrder} onChange={(e) => setQOrder(Number(e.target.value))} min={0} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialog(false)}>Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={saveQuestion}
              disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
            >
              {(createQuestionMutation.isPending || updateQuestionMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingQuestion ? "Save Changes" : "Create Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
