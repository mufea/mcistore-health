import React from "react";
import { MCI_BRAND_MARK_PATH } from "@shared/brand";

export const MCI_BRAND_MARK_URL = MCI_BRAND_MARK_PATH;

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

export default function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  return (
    <span className={`inline-flex shrink-0 overflow-hidden rounded-[0.72rem] bg-[#123b68] shadow-sm ring-1 ring-[#123b68]/40 ${sizeClasses[size]} ${className}`}>
      <img
        src={MCI_BRAND_MARK_URL}
        alt="MCI One More logo"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
