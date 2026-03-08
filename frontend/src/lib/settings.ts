import { normalizeLanguageCode } from "@/lib/constants";

export type AppSettings = {
  websiteLanguage: string;
  voiceInteractionEnabled: boolean;
};

const SETTINGS_KEY = "app-settings";
const WEBSITE_LANGUAGE_KEY = "websiteLanguage";

const defaultSettings: AppSettings = {
  websiteLanguage: "en",
  voiceInteractionEnabled: true,
};

export function getDefaultSettings(): AppSettings {
  return defaultSettings;
}

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const websiteLanguage = window.localStorage.getItem(WEBSITE_LANGUAGE_KEY);
    const raw = window.localStorage.getItem(SETTINGS_KEY);

    if (!raw && !websiteLanguage) {
      return defaultSettings;
    }

    const parsed = raw
      ? (JSON.parse(raw) as Partial<AppSettings> & { defaultLanguage?: string })
      : ({} as Partial<AppSettings> & { defaultLanguage?: string });

    const languageFromStorage = websiteLanguage || parsed.websiteLanguage || parsed.defaultLanguage || defaultSettings.websiteLanguage;

    return {
      websiteLanguage: normalizeLanguageCode(languageFromStorage),
      voiceInteractionEnabled:
        typeof parsed.voiceInteractionEnabled === "boolean"
          ? parsed.voiceInteractionEnabled
          : defaultSettings.voiceInteractionEnabled,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveAppSettings(settings: AppSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.localStorage.setItem(WEBSITE_LANGUAGE_KEY, settings.websiteLanguage);
  window.dispatchEvent(new CustomEvent("app-settings-updated", { detail: settings }));
}
