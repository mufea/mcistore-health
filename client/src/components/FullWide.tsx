import type { ReactNode } from "react";

export default function FullWide({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`w-full px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 ${className}`}>{children}</div>;
}
