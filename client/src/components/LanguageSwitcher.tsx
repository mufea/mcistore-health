import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  /** compact = icon-only button (for chatbot header); default = icon + native label */
  compact?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={cn(
            "gap-1.5 text-xs font-medium",
            compact ? "h-8 w-8 p-0" : "h-8 px-2.5",
            className
          )}
          aria-label="Select language"
        >
          <Globe className="h-4 w-4 flex-shrink-0" />
          {!compact && (
            <span className="hidden sm:inline">{current.nativeLabel}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLang(language.code as Language)}
            className={cn(
              "flex items-center justify-between gap-3 cursor-pointer",
              lang === language.code && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span>{language.nativeLabel}</span>
            <span className="text-xs text-muted-foreground">{language.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
