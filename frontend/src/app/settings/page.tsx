"use client";

import { useEffect, useState } from "react";
import { deleteCourses } from "@/lib/api";
import { SUPPORTED_LANGUAGES, normalizeLanguageCode } from "@/lib/constants";
import { getDefaultSettings, loadAppSettings, saveAppSettings } from "@/lib/settings";
import { useLanguage } from "@/i18n/language-context";
import { useTranslation } from "@/i18n/use-translation";
import type { TranslationKey } from "../../i18n/translations";

export default function SettingsPage() {
  const { setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [websiteLanguage, setWebsiteLanguage] = useState(getDefaultSettings().websiteLanguage);
  const [voiceInteractionEnabled, setVoiceInteractionEnabled] = useState(getDefaultSettings().voiceInteractionEnabled);
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessageKey, setStatusMessageKey] = useState<TranslationKey | null>(null);
  const [errorMessageKey, setErrorMessageKey] = useState<TranslationKey | null>(null);

  useEffect(() => {
    const settings = loadAppSettings();
    setWebsiteLanguage(settings.websiteLanguage);
    setVoiceInteractionEnabled(settings.voiceInteractionEnabled);
  }, []);

  const updateSettings = (nextLanguageCode: string, nextVoiceEnabled: boolean) => {
    saveAppSettings({
      websiteLanguage: nextLanguageCode,
      voiceInteractionEnabled: nextVoiceEnabled,
    });
  };

  const onLanguageChange = (languageCode: string) => {
    const normalizedCode = normalizeLanguageCode(languageCode);
    setWebsiteLanguage(normalizedCode);
    setLanguage(normalizedCode);
    setStatusMessageKey("websiteLanguageUpdated");
    setErrorMessageKey(null);
    updateSettings(normalizedCode, voiceInteractionEnabled);
  };

  const onVoiceToggle = () => {
    const nextValue = !voiceInteractionEnabled;
    setVoiceInteractionEnabled(nextValue);
    setStatusMessageKey(nextValue ? "voiceInteractionEnabled" : "voiceInteractionDisabled");
    setErrorMessageKey(null);
    updateSettings(websiteLanguage, nextValue);
  };

  const onClearCourses = async () => {
    const confirmed = window.confirm(t("clearCoursesConfirm"));
    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    setStatusMessageKey(null);
    setErrorMessageKey(null);

    try {
      await deleteCourses();
      setStatusMessageKey("clearCoursesSuccess");
    } catch {
      setErrorMessageKey("clearCoursesError");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <main className="w-full space-y-6">
      <section className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold text-slate-900">{t("settingsTitle")}</h1>
        <p className="mt-2 text-sm text-gray-700">{t("settingsSubtitle")}</p>
      </section>

      {statusMessageKey && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t(statusMessageKey)}</p>
      )}

      {errorMessageKey && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{t(errorMessageKey)}</p>
      )}

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">{t("userPreferences")}</h2>
          <p className="mt-1 text-sm text-gray-700">{t("websiteLanguageHelp")}</p>

          <label htmlFor="default-language" className="mt-4 block text-sm font-medium text-gray-500">
            {t("websiteLanguage")}
          </label>
          <select
            id="default-language"
            value={websiteLanguage}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {t(language.translationKey)}
              </option>
            ))}
          </select>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">{t("voiceSettings")}</h2>
          <p className="mt-1 text-sm text-gray-700">{t("voiceSettingsHelp")}</p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3">
            <span className="text-sm font-medium text-slate-800">{t("enableVoiceInteraction")}</span>
            <button
              type="button"
              onClick={onVoiceToggle}
              aria-pressed={voiceInteractionEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                voiceInteractionEnabled ? "bg-red-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  voiceInteractionEnabled ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">{t("dataManagement")}</h2>
          <p className="mt-1 text-sm text-gray-700">{t("clearCoursesHelp")}</p>

          <button
            type="button"
            onClick={onClearCourses}
            disabled={isClearing}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClearing ? t("clearing") : t("clearAllCourses")}
          </button>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-xl font-semibold text-slate-900">{t("demoInformation")}</h2>
          <p className="mt-2 text-sm text-gray-700">
            {t("demoInfoText")}
          </p>
        </article>
      </section>
    </main>
  );
}