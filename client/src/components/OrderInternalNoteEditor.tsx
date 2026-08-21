import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LockKeyhole } from "lucide-react";

type OrderInternalNoteEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving?: boolean;
};

export default function OrderInternalNoteEditor({ value, onChange, onSave, isSaving = false }: OrderInternalNoteEditorProps) {
  return (
    <section aria-labelledby="internal-order-note-title" className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      <div className="mb-2 flex items-center gap-2">
        <LockKeyhole className="h-4 w-4 text-amber-700" aria-hidden="true" />
        <div>
          <h3 id="internal-order-note-title" className="text-sm font-semibold text-amber-950">Internal admin note</h3>
          <p className="text-xs text-amber-800">Only administrators can view this note. It is never shown to customers.</p>
        </div>
      </div>
      <Textarea
        aria-label="Internal admin note"
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, 2000))}
        placeholder="Add fulfillment, packing, or follow-up instructions…"
        className="min-h-20 resize-none bg-background text-sm"
        maxLength={2000}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs text-amber-800">{value.length}/2000</span>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Save internal note
        </Button>
      </div>
    </section>
  );
}
