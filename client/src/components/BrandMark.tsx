import React from "react";
import { MCI_BRAND_MARK_PATH } from "@shared/brand";

export const MCI_BRAND_MARK_URL = MCI_BRAND_MARK_PATH;

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

export default function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  return (
    <span className={`inline-flex shrink-0 overflow-hidden rounded-[0.72rem] bg-[#0b4f83] shadow-[0_4px_14px_rgba(11,79,131,0.3)] ring-1 ring-[#3b82c4]/60 ${sizeClasses[size]} ${className}`}>
      <img
        src={MCI_BRAND_MARK_URL}
        alt="MCI One More logo"
        className="h-full w-full object-contain brightness-110 contrast-110 drop-shadow-[0_1px_2px_rgba(255,255,255,0.28)]"
      />
    </span>
  );
}
