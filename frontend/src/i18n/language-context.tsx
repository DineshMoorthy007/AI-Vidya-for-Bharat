"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupportedUiLanguage, type SupportedUiLanguage } from "./translations";

type LanguageContextValue = {
  currentLanguage: SupportedUiLanguage;
  setLanguage: (language: string) => void;
};

const WEBSITE_LANGUAGE_KEY = "websiteLanguage";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedUiLanguage>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(WEBSITE_LANGUAGE_KEY);

    if (saved && isSupportedUiLanguage(saved)) {
      setCurrentLanguage(saved);
    }
  }, []);

  const setLanguage = (language: string) => {
    if (!isSupportedUiLanguage(language)) {
      return;
    }

    setCurrentLanguage(language);
    window.localStorage.setItem(WEBSITE_LANGUAGE_KEY, language);
  };

  const value = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
    }),
    [currentLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
