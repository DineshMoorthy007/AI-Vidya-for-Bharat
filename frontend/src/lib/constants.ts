export type LanguageOption = {
  label: string;
  code: string;
  translationKey:
    | "languageEnglish"
    | "languageHindi"
    | "languageTamil"
    | "languageTelugu"
    | "languageKannada";
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { label: "English", code: "en", translationKey: "languageEnglish" },
  { label: "हिन्दी", code: "hi", translationKey: "languageHindi" },
  { label: "தமிழ்", code: "ta", translationKey: "languageTamil" },
  { label: "తెలుగు", code: "te", translationKey: "languageTelugu" },
  { label: "ಕನ್ನಡ", code: "kn", translationKey: "languageKannada" },
];

export const BACKEND_SUPPORTED_LANGUAGE_CODES = ["en", "hi", "ta", "te", "kn"] as const;

export const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS.filter((language) =>
  BACKEND_SUPPORTED_LANGUAGE_CODES.includes(language.code as (typeof BACKEND_SUPPORTED_LANGUAGE_CODES)[number]),
);

const LEGACY_LABEL_TO_CODE_MAP = new Map<string, string>([
  ["english", "en"],
  ["hindi", "hi"],
  ["हिन्दी", "hi"],
  ["தமிழ்", "ta"],
  ["tamil", "ta"],
  ["తెలుగు", "te"],
  ["telugu", "te"],
  ["ಕನ್ನಡ", "kn"],
  ["kannada", "kn"],
]);

export function getLanguageLabel(languageCodeOrLabel: string): string {
  const normalized = languageCodeOrLabel.trim().toLowerCase();
  const byCode = LANGUAGE_OPTIONS.find((language) => language.code === normalized);

  if (byCode) {
    return byCode.label;
  }

  const byLabel = LANGUAGE_OPTIONS.find((language) => language.label.toLowerCase() === normalized);
  return byLabel ? byLabel.label : languageCodeOrLabel;
}

export function normalizeLanguageCode(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (LANGUAGE_OPTIONS.some((language) => language.code === normalized)) {
    return normalized;
  }

  return LEGACY_LABEL_TO_CODE_MAP.get(normalized) ?? "en";
}

export function isSupportedLanguageCode(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((language) => language.code === code);
}