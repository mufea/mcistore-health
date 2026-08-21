import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckoutRemoveItemButtonProps = {
  itemName: string;
  label: string;
  onRemove: () => void;
};

export default function CheckoutRemoveItemButton({ itemName, label, onRemove }: CheckoutRemoveItemButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      aria-label={`${label}: ${itemName}`}
      onClick={onRemove}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
