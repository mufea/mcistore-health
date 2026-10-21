import React from "react";
import { MCI_BRAND_MARK_PATH } from "@shared/brand";

export const MCI_BRAND_MARK_URL = MCI_BRAND_MARK_PATH;

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-9 w-9",
};

export default function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  return (
    <span className={`inline-flex shrink-0 overflow-hidden rounded-[0.72rem] bg-primary/10 shadow-sm ring-1 ring-primary/15 ${sizeClasses[size]} ${className}`}>
      <img
        src={MCI_BRAND_MARK_URL}
        alt="MCI Store logo"
        className="h-full w-full scale-[1.32] object-cover"
      />
    </span>
  );
}
