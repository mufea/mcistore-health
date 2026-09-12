import React from "react";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminProductStatusToggleProps = {
  productName: string;
  isActive: boolean;
  isPending?: boolean;
  onToggle: () => void;
};

export default function AdminProductStatusToggle({
  productName,
  isActive,
  isPending = false,
  onToggle,
}: AdminProductStatusToggleProps) {
  const actionLabel = isActive ? "Deactivate" : "Activate";

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={`gap-1.5 px-2 ${isActive ? "text-amber-700 hover:text-amber-800" : "text-primary hover:text-primary"}`}
      onClick={onToggle}
      disabled={isPending}
      title={`${actionLabel} ${productName}`}
      aria-label={`${actionLabel} ${productName}`}
      aria-pressed={isActive}
    >
      <Power className={`h-3.5 w-3.5 ${isPending ? "animate-pulse" : ""}`} aria-hidden="true" />
      <span>{isPending ? "Updating..." : actionLabel}</span>
    </Button>
  );
}
