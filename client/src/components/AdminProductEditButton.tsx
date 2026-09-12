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
      className="gap-1.5 px-2"
      onClick={onEdit}
      title={`Edit ${productName}`}
      aria-label={`Edit ${productName}`}
    >
      <Edit className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Edit</span>
    </Button>
  );
}
