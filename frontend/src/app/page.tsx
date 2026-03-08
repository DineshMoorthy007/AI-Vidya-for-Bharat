"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import LanguageSelector from "@/components/LanguageSelector";
import TopicLanguageSelectorModal from "@/components/TopicLanguageSelectorModal";
import { fetchCourses, type CourseListItem } from "@/lib/api";
import { SUPPORTED_LANGUAGES, isSupportedLanguageCode } from "@/lib/constants";
import { loadAppSettings } from "@/lib/settings";
import { useTranslation } from "@/i18n/use-translation";
import type { TranslationKey } from "../i18n/translations";

type TopicCategory = {
  categoryKey: TranslationKey;
  topics: TranslationKey[];
};

type CourseProgress = {
  viewedChapters: number;
  totalChapters: number;
  progressPercent: number;
};

const topicCategories: TopicCategory[] = [
  {
    categoryKey: "programming",
    topics: ["topicPython", "topicJavaScript", "topicReact", "topicTypeScript", "topicDataStructures"],
  },
  {
    categoryKey: "artificialIntelligence",
    topics: ["topicMachineLearning", "topicNeuralNetworks", "topicPromptEngineering", "topicComputerVision"],
  },
  {
    categoryKey: "careerSkills",
    topics: ["topicResumeWriting", "topicInterviewPreparation", "topicCommunicationSkills", "topicTimeManagement"],
  },
];

function getCourseProgress(courseId: string): CourseProgress {
  if (typeof window === "undefined") {
    return { viewedChapters: 0, totalChapters: 0, progressPercent: 0 };
  }

  try {
    const viewedRaw = window.localStorage.getItem(`course-progress:${courseId}`);
    const metaRaw = window.localStorage.getItem(`course-progress-meta:${courseId}`);

    const viewedChapters = viewedRaw ? (JSON.parse(viewedRaw) as string[]).length : 0;
    const parsedMeta = metaRaw ? (JSON.parse(metaRaw) as { totalChapters?: number }) : null;
    const totalChapters = parsedMeta?.totalChapters && parsedMeta.totalChapters > 0 ? parsedMeta.totalChapters : 0;

    if (!totalChapters) {
      return { viewedChapters, totalChapters: 0, progressPercent: viewedChapters > 0 ? 10 : 0 };
    }

    const progressPercent = Math.max(0, Math.min(100, Math.round((viewedChapters / totalChapters) * 100)));
    return { viewedChapters, totalChapters, progressPercent };
  } catch {
    return { viewedChapters: 0, totalChapters: 0, progressPercent: 0 };
  }
}

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [topic, setTopic] = useState("");
  const [selectedLanguageCode, setSelectedLanguageCode] = useState("en");
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState("");
  const [recentCourses, setRecentCourses] = useState<CourseListItem[]>([]);
  const generateSectionRef = useRef<HTMLElement>(null);
  const generateButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const applySettings = () => {
      const settings = loadAppSettings();
      if (isSupportedLanguageCode(settings.websiteLanguage)) {
        setSelectedLanguageCode(settings.websiteLanguage);
      }
      setMounted(true);
    };

    applySettings();
    window.addEventListener("app-settings-updated", applySettings);

    return () => {
      window.removeEventListener("app-settings-updated", applySettings);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadCourses = async () => {
      try {
        const courses = await fetchCourses();
        if (!isCancelled) {
          setRecentCourses(courses);
        }
      } catch {
        if (!isCancelled) {
          setRecentCourses([]);
        }
      }
    };

    const onCoursesUpdated = () => {
      void loadCourses();
    };

    void loadCourses();
    window.addEventListener("courses-updated", onCoursesUpdated);

    return () => {
      isCancelled = true;
      window.removeEventListener("courses-updated", onCoursesUpdated);
    };
  }, []);

  const continueLearningCourses = useMemo(() => {
    return [...recentCourses].reverse().slice(0, 3);
  }, [recentCourses]);

  const handleSelectSuggestedTopic = (selectedTopicKey: TranslationKey, autoGenerate = false) => {
    const selectedTopic = t(selectedTopicKey);
    setTopic(selectedTopic);
    setError("");

    if (autoGenerate) {
      setModalTopic(selectedTopic);
      setIsTopicModalOpen(true);
      return;
    }

    generateButtonRef.current?.focus();
  };

  const handleGenerateCourse = async (overrideTopic?: string) => {
    const trimmedTopic = (overrideTopic ?? topic).trim();

    if (loading) {
      return;
    }

    if (!trimmedTopic) {
      setError(t("topicRequired"));
      return;
    }

    setError("");
    setLoading(true);

    router.push(
      `/generate?topic=${encodeURIComponent(trimmedTopic)}&lang=${encodeURIComponent(selectedLanguageCode)}`,
    );
  };

  const handleTopicLanguageSelect = (languageCode: string) => {
    const selectedTopic = modalTopic.trim();

    if (!selectedTopic || loading) {
      return;
    }

    setIsTopicModalOpen(false);
    setLoading(true);
    router.push(`/generate?topic=${encodeURIComponent(selectedTopic)}&lang=${encodeURIComponent(languageCode)}`);
  };

  return (
    <main className="w-full space-y-6">
      <TopicLanguageSelectorModal
        isOpen={isTopicModalOpen}
        topic={modalTopic}
        isLoading={loading}
        onClose={() => setIsTopicModalOpen(false)}
        onSelectLanguage={handleTopicLanguageSelect}
      />

      <section ref={generateSectionRef} className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {t("demoModeNoLogin")}
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{t("appName")}</h1>
        <p className="mt-2 text-sm text-gray-700 sm:text-base">{t("generateCourseSubtitle")}</p>

        <div className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium text-gray-500">
              {t("topic")}
            </label>
            <input
              id="topic"
              type="text"
              placeholder={t("topicPlaceholder")}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              aria-describedby="topic-help"
            />
            <p id="topic-help" className="text-xs text-gray-500">
              {t("topicHelp")}
            </p>
          </div>

          <LanguageSelector
            label={t("language")}
            languages={SUPPORTED_LANGUAGES}
            selectedLanguageCode={mounted ? selectedLanguageCode : "en"}
            onSelect={setSelectedLanguageCode}
          />

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            ref={generateButtonRef}
            type="button"
            onClick={() => {
              void handleGenerateCourse();
            }}
            disabled={loading}
            className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("generating") : t("generateCourse")}
          </button>
        </div>
      </section>

      {continueLearningCourses.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{t("continueLearning")}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {continueLearningCourses.map((course) => {
              const progress = getCourseProgress(course.id);

              return (
                <Link
                  key={course.id}
                  href={`/course/${encodeURIComponent(course.id)}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{t("progress")}: {progress.progressPercent}%</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${progress.progressPercent}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {progress.totalChapters > 0
                      ? `${progress.viewedChapters}/${progress.totalChapters} ${t("chaptersViewed")}`
                      : progress.viewedChapters > 0
                        ? `${progress.viewedChapters} ${t("chaptersViewed")}`
                        : t("startCourseToTrack")}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">{t("popularTopics")}</h2>
        <p className="mt-2 text-sm text-gray-700">{t("chooseTopicQuickly")}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topicCategories.map((group) => (
            <article key={group.categoryKey} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-red-700">{t(group.categoryKey)}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.topics.map((suggestedTopicKey) => (
                  <button
                    key={suggestedTopicKey}
                    type="button"
                    onClick={() => handleSelectSuggestedTopic(suggestedTopicKey, true)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-gray-50"
                  >
                    {t(suggestedTopicKey)}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}