"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { CourseListItem } from "@/lib/api";
import { getLanguageLabel } from "@/lib/constants";
import { useTranslation } from "@/i18n/use-translation";

type CourseCardProps = {
  course: CourseListItem;
  formattedCreatedAt: string;
  progressPercent?: number;
};

export default function CourseCard({ course, formattedCreatedAt, progressPercent }: CourseCardProps) {
  const { t } = useTranslation();

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className="flex items-center gap-2.5">
        <BookOpen size={20} className="text-red-500" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
      </div>

      <dl className="mt-3 space-y-1 text-sm text-gray-700">
        <div>
          <dt className="inline font-medium text-slate-700">{t("topic")}: </dt>
          <dd className="inline">{course.topic}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-700">{t("language")}: </dt>
          <dd className="inline">{getLanguageLabel(course.language)}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-700">{t("createdTime")}: </dt>
          <dd className="inline">{formattedCreatedAt}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/course/${encodeURIComponent(course.id)}`}
          className="inline-flex rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          {t("openCourse")}
        </Link>
      </div>

      {typeof progressPercent === "number" && (
        <div className="mt-4">
          <p className="text-sm text-slate-600">{t("progress")}: {progressPercent}%</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
            <div className="h-full rounded-full bg-red-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}
    </article>
  );
}