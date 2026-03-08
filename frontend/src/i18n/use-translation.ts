"use client";

import { useCallback, useMemo } from "react";
import { useLanguage } from "@/i18n/language-context";
import { translations, type TranslationKey } from "./translations";

type TranslationParams = Record<string, string | number>;

export function useTranslation() {
  const { currentLanguage } = useLanguage();
  const dictionary = useMemo(
    () =>
      (translations[currentLanguage as keyof typeof translations] ??
        translations.en) as Partial<Record<TranslationKey, string>>,
    [currentLanguage],
  );
  const englishDictionary = useMemo(
    () => translations.en as Record<TranslationKey, string>,
    [],
  );

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      const raw = dictionary[key] ?? englishDictionary[key] ?? key;

      if (!params) {
        return raw;
      }

      return Object.entries(params).reduce((value, [paramKey, paramValue]) => {
        return value.replaceAll(`{${paramKey}}`, String(paramValue));
      }, raw);
    },
    [dictionary, englishDictionary],
  );

  return { t, currentLanguage };
}
