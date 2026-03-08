"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ChapterList from "@/components/ChapterList";
import CourseOverviewCard from "@/components/CourseOverviewCard";
import LearningOutcomesCard from "@/components/LearningOutcomesCard";
import RecommendedVideos from "@/components/RecommendedVideos";
import VideoModal from "@/components/VideoModal";
import AIGuruFloatingButton from "@/components/AIGuruFloatingButton";
import { fetchCourse, type Course } from "@/lib/api";
import { getLanguageLabel } from "@/lib/constants";
import { useTranslation } from "@/i18n/use-translation";

function deriveOverview(course: Course, fallbackText: string): string {
  const overview = course.overview?.trim();
  if (overview) {
    return overview;
  }

  const summary = course.summary?.trim();
  if (summary) {
    return summary;
  }

  const firstChapterExplanation = course.chapters[0]?.explanation?.trim();
  if (firstChapterExplanation) {
    return firstChapterExplanation;
  }

  return fallbackText;
}

function deriveOutcomes(
  course: Course,
  templates: {
    understandChapter: (chapter: string) => string;
    learnKeyIdeas: (chapter: string) => string;
    implementConcepts: (chapter: string) => string;
    applyLearningProblems: (chapter: string) => string;
    understandFundamentals: (topic: string) => string;
    learnCoreConcepts: string;
    applyPracticalScenarios: (topic: string) => string;
  },
): string[] {
  const backendOutcomes = course.learning_outcomes ?? course.learningOutcomes;
  if (backendOutcomes && backendOutcomes.length > 0) {
    return backendOutcomes;
  }

  const chapterBasedOutcomes = course.chapters
    .slice(0, 4)
    .map((chapter, index) => {
      const chapterTitle = chapter.title.toLowerCase();

      if (index === 0) {
        return templates.understandChapter(chapterTitle);
      }

      if (index === 1) {
        return templates.learnKeyIdeas(chapterTitle);
      }

      if (index === 2) {
        return templates.implementConcepts(chapterTitle);
      }

      return templates.applyLearningProblems(chapterTitle);
    });

  if (chapterBasedOutcomes.length > 0) {
    return chapterBasedOutcomes;
  }

  return [
    templates.understandFundamentals(course.topic),
    templates.learnCoreConcepts,
    templates.applyPracticalScenarios(course.topic),
  ];
}

export default function CourseDetailsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [viewedChapterIds, setViewedChapterIds] = useState<string[]>([]);
  const [activeChapterId, setActiveChapterId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadCourse() {
      const courseId = params.id;

      if (!courseId) {
        setError(t("courseNotFound"));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchCourse(courseId);
        if (!isCancelled) {
          setCourse(response);
          setIsLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setError(t("courseNotFound"));
          setIsLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!course || typeof window === "undefined") {
      return;
    }

    const progressKey = `course-progress:${course.id}`;
    const raw = window.localStorage.getItem(progressKey);

    if (!raw) {
      setViewedChapterIds([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      const validChapterIds = new Set(
        course.chapters.map((chapter) => chapter.id),
      );
      const nextViewed = parsed.filter((chapterId) =>
        validChapterIds.has(chapterId),
      );
      setViewedChapterIds(nextViewed);
    } catch {
      setViewedChapterIds([]);
    }
  }, [course]);

  useEffect(() => {
    if (!course || typeof window === "undefined") {
      return;
    }

    const progressKey = `course-progress:${course.id}`;
    window.localStorage.setItem(progressKey, JSON.stringify(viewedChapterIds));

    const progressMetaKey = `course-progress-meta:${course.id}`;
    window.localStorage.setItem(
      progressMetaKey,
      JSON.stringify({
        totalChapters: course.chapters.length,
      }),
    );
  }, [course, viewedChapterIds]);

  useEffect(() => {
    if (!course || course.chapters.length === 0) {
      setActiveChapterId("");
      return;
    }

    setActiveChapterId((current) => {
      if (
        current &&
        course.chapters.some((chapter) => chapter.id === current)
      ) {
        return current;
      }

      return course.chapters[0].id;
    });
  }, [course]);

  const handleChapterExpand = (chapterId: string) => {
    setViewedChapterIds((current) =>
      current.includes(chapterId) ? current : [...current, chapterId],
    );
    setActiveChapterId(chapterId);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] w-full items-center">
        <section className="w-full rounded-xl border border-amber-100 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-700">
            {t("loadingGeneratedCourse")}
          </p>
        </section>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="flex min-h-[60vh] w-full items-center">
        <section className="w-full rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <h1 className="text-3xl font-semibold text-slate-900">
            {t("couldNotLoadCourse")}
          </h1>
          <p className="mt-2 text-sm text-gray-700">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-6 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            {t("backToHome")}
          </button>
        </section>
      </main>
    );
  }

  const overview = deriveOverview(
    course,
    t("courseFallbackOverview", {
      topic: course.topic,
      language: getLanguageLabel(course.language),
    }),
  );
  const outcomes = deriveOutcomes(course, {
    understandChapter: (chapter) => t("outcomeUnderstandChapter", { chapter }),
    learnKeyIdeas: (chapter) => t("outcomeLearnKeyIdeas", { chapter }),
    implementConcepts: (chapter) => t("outcomeImplementConcepts", { chapter }),
    applyLearningProblems: (chapter) =>
      t("outcomeApplyLearningProblems", { chapter }),
    understandFundamentals: (topic) =>
      t("outcomeUnderstandFundamentals", { topic }),
    learnCoreConcepts: t("outcomeLearnCoreConcepts"),
    applyPracticalScenarios: (topic) =>
      t("outcomeApplyPracticalScenarios", { topic }),
  });
  const chapterTitles = course.chapters.map((chapter) => chapter.title);
  const totalChapters = course.chapters.length;
  const progressPercent =
    totalChapters > 0
      ? Math.round((viewedChapterIds.length / totalChapters) * 100)
      : 0;
  const activeChapter =
    course.chapters.find((chapter) => chapter.id === activeChapterId) ??
    course.chapters[0];

  const aiTools = [
    {
      tool: "explain",
      prompt: activeChapter
        ? t("aiPromptExplainChapter", { chapter: activeChapter.title })
        : t("aiPromptExplainChapterFallback"),
    },
    {
      tool: "quiz",
      prompt: activeChapter
        ? t("aiPromptGenerateQuiz", { chapter: activeChapter.title })
        : t("aiPromptGenerateQuizFallback"),
    },
    {
      tool: "examples",
      prompt: activeChapter
        ? t("aiPromptGiveExamples", { chapter: activeChapter.title })
        : t("aiPromptGiveExamplesFallback"),
    },
  ] as const;

  return (
    <main className="relative w-full">
      <div className="space-y-6">
        <section className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="mb-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              aria-label={t("backToDashboard")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              {t("generatedCourse")}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {course.title}
            </h1>
            <p className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
              {t("generatedByAi")}
            </p>
            <p className="text-sm text-gray-700">
              {t("topic")}:{" "}
              <span className="font-medium text-slate-800">{course.topic}</span>{" "}
              • {t("courseLanguage")}:{" "}
              <span className="font-medium text-slate-800">
                {getLanguageLabel(course.language)}
              </span>
            </p>
          </div>
        </section>

        <CourseOverviewCard overview={overview} />

        <LearningOutcomesCard outcomes={outcomes} />

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("courseProgress")}
          </h2>
          <div
            className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <div
              className="h-full rounded-full bg-red-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">
            {progressPercent}% ({viewedChapterIds.length}/{totalChapters}{" "}
            {t("chaptersViewed")})
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            {t("courseChapters")}
          </h2>
          <ChapterList
            chapters={course.chapters}
            onChapterExpand={handleChapterExpand}
          />
        </section>

        {/* Video Modal Section */}
        <VideoModal
          topic={course.topic}
          language={course.language}
          onClose={() => setShowVideoModal(false)}
        />

        <RecommendedVideos
          topic={course.topic}
          chapterTitles={chapterTitles}
          language={course.language}
        />

        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-700">{t("needHelpCourse")}</p>
          <Link
            href={`/chat?courseId=${encodeURIComponent(course.id)}${activeChapter ? `&chapter=${encodeURIComponent(activeChapter.title)}` : ""}`}
            className="mt-3 inline-flex rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            {t("askAiGuru")}
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("aiLearningTools")}
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            {t("useAiToolsForCourse")}
            {activeChapter ? ` ${t("andChapter")}: ${activeChapter.title}` : ""}
            .
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {aiTools.map((tool) => (
              <Link
                key={tool.tool}
                href={`/chat?courseId=${encodeURIComponent(course.id)}${activeChapter ? `&chapter=${encodeURIComponent(activeChapter.title)}` : ""}&tool=${encodeURIComponent(tool.tool)}&prompt=${encodeURIComponent(tool.prompt)}`}
                className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-gray-50"
              >
                {tool.tool === "explain"
                  ? t("explainChapter")
                  : tool.tool === "quiz"
                    ? t("generateQuiz")
                    : t("giveExamples")}
              </Link>
            ))}

            <Link
              href={`/chat?courseId=${encodeURIComponent(course.id)}${activeChapter ? `&chapter=${encodeURIComponent(activeChapter.title)}` : ""}&tool=ask-guru`}
              className="inline-flex rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              {t("askAiGuru")}
            </Link>
          </div>
        </section>
      </div>

      <AIGuruFloatingButton courseId={course.id} />
    </main>
  );
}
