"use client";

import { useState } from "react";
import type { Chapter } from "@/lib/api";
import { useTranslation } from "@/i18n/use-translation";

type ChapterListProps = {
  chapters: Chapter[];
  onChapterExpand?: (chapterId: string) => void;
};

export default function ChapterList({ chapters, onChapterExpand }: ChapterListProps) {
  const { t } = useTranslation();
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>([]);

  const toggleChapter = (chapterId: string) => {
    const isCurrentlyExpanded = expandedChapterIds.includes(chapterId);

    if (!isCurrentlyExpanded) {
      onChapterExpand?.(chapterId);
    }

    setExpandedChapterIds((current) => {
      if (isCurrentlyExpanded) {
        return current.filter((id) => id !== chapterId);
      }

      return [...current, chapterId];
    });
  };

  return (
    <div className="space-y-3">
      {chapters.map((chapter, index) => {
        const isExpanded = expandedChapterIds.includes(chapter.id);

        return (
          <article key={chapter.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700">{t("chapter")} {index + 1}</p>
                <h3 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">{chapter.title}</h3>
              </div>

              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="inline-flex shrink-0 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
              >
                {isExpanded ? t("collapse") : t("expand")}
              </button>
            </div>

            {isExpanded && <p className="mt-3 text-sm leading-relaxed text-gray-700">{chapter.explanation}</p>}
          </article>
        );
      })}
    </div>
  );
}