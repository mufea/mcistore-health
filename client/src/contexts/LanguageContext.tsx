import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { type Language, LANGUAGES } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  dir: "ltr",
});

const STORAGE_KEY = "mci_language";

// Detect the best matching language from the browser's preferred languages
function detectBrowserLanguage(): Language {
  const supported = LANGUAGES.map((l) => l.code);
  const browserLangs = navigator.languages ?? [navigator.language];
  for (const bl of browserLangs) {
    // Try exact match first (e.g. "zh"), then prefix match (e.g. "zh-CN" → "zh")
    const exact = bl.toLowerCase() as Language;
    if (supported.includes(exact)) return exact;
    const prefix = bl.split("-")[0]?.toLowerCase() as Language;
    if (prefix && supported.includes(prefix)) return prefix;
    // Map common locale variants
    if (bl.startsWith("ar")) return "ar";
    if (bl.startsWith("zh")) return "zh";
    if (bl.startsWith("es")) return "es";
    if (bl.startsWith("hi")) return "hi";
    if (bl.startsWith("id")) return "id";
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    // 1. Respect explicit user choice stored in localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && LANGUAGES.find((l) => l.code === stored)) return stored;
    // 2. Fall back to browser language detection
    return detectBrowserLanguage();
  });

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
  const { isAuthenticated } = useAuth();

  // Load profile to sync language preference from DB
  const { data: profile } = trpc.userProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  // Track whether we have applied the profile language once
  const profileApplied = useRef(false);

  useEffect(() => {
    if (profile?.preferredLanguage && !profileApplied.current) {
      const supported = LANGUAGES.map((l) => l.code);
      const profileLang = profile.preferredLanguage as Language;
      if (supported.includes(profileLang)) {
        // Only override if the user hasn't manually changed it this session
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setLangState(profileLang);
          localStorage.setItem(STORAGE_KEY, profileLang);
        }
      }
      profileApplied.current = true;
    }
  }, [profile]);

  // Mutation to persist language to DB when user changes it
  const updateProfile = trpc.userProfile.update.useMutation();

  // Apply dir to <html> element for RTL support (Arabic)
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    // Persist to DB if authenticated
    if (isAuthenticated) {
      updateProfile.mutate({ preferredLanguage: newLang });
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
