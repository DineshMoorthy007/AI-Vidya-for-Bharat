"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCourses, type CourseListItem } from "@/lib/api";
import CourseCard from "@/components/CourseCard";
import { useTranslation } from "@/i18n/use-translation";

function formatCreatedAt(value: string | undefined, unknownLabel: string) {
  if (!value) {
    return unknownLabel;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function getCourseProgressPercent(courseId: string): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const viewedRaw = window.localStorage.getItem(`course-progress:${courseId}`);
    const metaRaw = window.localStorage.getItem(`course-progress-meta:${courseId}`);

    const viewedCount = viewedRaw ? (JSON.parse(viewedRaw) as string[]).length : 0;
    const parsedMeta = metaRaw ? (JSON.parse(metaRaw) as { totalChapters?: number }) : null;
    const totalChapters = parsedMeta?.totalChapters ?? 0;

    if (!totalChapters) {
      return viewedCount > 0 ? 10 : 0;
    }

    return Math.max(0, Math.min(100, Math.round((viewedCount / totalChapters) * 100)));
  } catch {
    return 0;
  }
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCourses = courses.filter((course) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      course.title.toLowerCase().includes(normalizedQuery) ||
      course.topic.toLowerCase().includes(normalizedQuery)
    );
  });

  useEffect(() => {
    let isCancelled = false;

    const loadCourses = async () => {
      setError("");
      setIsLoading(true);

      try {
        const response = await fetchCourses();

        if (!isCancelled) {
          setCourses(response);
        }
      } catch {
        if (!isCancelled) {
          setError(t("coursesLoadError"));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
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

  return (
    <main className="w-full space-y-6">
      <section className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold text-slate-900">{t("yourAiLearningLibrary")}</h1>
        <p className="mt-2 text-sm text-gray-700">{t("allCoursesStored")}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-700">{courses.length} {courses.length === 1 ? t("oneCourseGenerated") : t("courseGeneratedCount")}</p>

          <div className="w-full sm:max-w-sm">
            <label htmlFor="search-courses" className="text-sm font-medium text-gray-500">
              {t("searchCourses")}
            </label>
            <input
              id="search-courses"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("searchByTitleOrTopic")}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>
      </section>

      {isLoading && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-700">{t("loadingCourses")}</p>
        </section>
      )}

      {!isLoading && error && (
        <section className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
        </section>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">{t("noCoursesYet")}</p>
          <p className="mt-2 text-sm text-gray-700">{t("createFirstCourse")}</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            {t("generateFirstCourse")}
          </Link>
        </section>
      )}

      {!isLoading && !error && courses.length > 0 && filteredCourses.length === 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">{t("noMatchingCourses")}</p>
          <p className="mt-2 text-sm text-gray-700">{t("searchDifferentTitle")}</p>
        </section>
      )}

      {!isLoading && !error && filteredCourses.length > 0 && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              formattedCreatedAt={formatCreatedAt(course.createdAt, t("unknown"))}
              progressPercent={getCourseProgressPercent(course.id)}
            />
          ))}
        </section>
      )}
    </main>
  );
}