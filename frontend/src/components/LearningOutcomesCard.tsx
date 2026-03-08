"use client";

import { useTranslation } from "@/i18n/use-translation";

type LearningOutcomesCardProps = {
  outcomes: string[];
};

export default function LearningOutcomesCard({ outcomes }: LearningOutcomesCardProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{t("whatYouWillLearn")}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700 sm:text-base">
        {outcomes.map((outcome, index) => (
          <li key={`${outcome}-${index}`}>{outcome}</li>
        ))}
      </ul>
    </section>
  );
}