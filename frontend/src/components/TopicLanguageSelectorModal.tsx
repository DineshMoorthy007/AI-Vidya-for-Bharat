"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useTranslation } from "@/i18n/use-translation";

type TopicLanguageSelectorModalProps = {
  isOpen: boolean;
  topic: string;
  isLoading: boolean;
  onClose: () => void;
  onSelectLanguage: (languageCode: string) => void;
};

export default function TopicLanguageSelectorModal({
  isOpen,
  topic,
  isLoading,
  onClose,
  onSelectLanguage,
}: TopicLanguageSelectorModalProps) {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" role="dialog" aria-modal="true" aria-label={t("selectCourseLanguageTitle")}>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-900">{t("selectCourseLanguageTitle")}</h2>
        <p className="mt-2 text-sm text-gray-700">{t("selectCourseLanguageSubtitle", { topic })}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectLanguage(language.code)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t(language.translationKey)}
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}