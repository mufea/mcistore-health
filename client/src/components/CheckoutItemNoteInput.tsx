import React from "react";
import { Textarea } from "@/components/ui/textarea";

type CheckoutItemNoteInputProps = {
  itemName: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export default function CheckoutItemNoteInput({ itemName, label, placeholder, value, onChange }: CheckoutItemNoteInputProps) {
  return (
    <Textarea
      aria-label={`${label}: ${itemName}`}
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, 500))}
      placeholder={placeholder}
      className="mt-2 min-h-14 resize-none text-xs"
      maxLength={500}
    />
  );
}
