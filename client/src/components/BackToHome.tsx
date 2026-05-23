import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

interface BackToHomeProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  label?: string;
}

export default function BackToHome({
  className = "",
  variant = "ghost",
  size = "sm",
  label = "Back to Home",
}: BackToHomeProps) {
  const [, navigate] = useLocation();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => navigate("/")}
      className={`gap-2 text-muted-foreground hover:text-foreground ${className}`}
    >
      <Home className="h-4 w-4" />
      {label}
    </Button>
  );
}
