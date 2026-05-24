import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Language, LANGUAGES } from "@/lib/i18n";

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && LANGUAGES.find((l) => l.code === stored)) return stored;
    return "en";
  });

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  // Apply dir to <html> element for RTL support (Arabic)
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
