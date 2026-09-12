import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminProductEditButtonProps = {
  productName: string;
  onEdit: () => void;
};

export default function AdminProductEditButton({ productName, onEdit }: AdminProductEditButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="inline-flex min-w-[78px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap bg-background px-2 text-foreground hover:bg-muted"
      onClick={onEdit}
      title={`Edit ${productName}`}
      aria-label={`Edit ${productName}`}
    >
      <Edit className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Edit</span>
    </Button>
  );
}
