"use client";

import { useTranslation } from "@/i18n/use-translation";

type CourseOverviewCardProps = {
  overview: string;
};

export default function CourseOverviewCard({ overview }: CourseOverviewCardProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{t("courseOverview")}</h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">{overview}</p>
    </section>
  );
}