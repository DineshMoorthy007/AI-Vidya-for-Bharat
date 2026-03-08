/**
 * Chapter List with Inline Video Support
 * Enhanced ChapterList that shows videos for each chapter when expanded
 */

"use client";

import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import type { Chapter } from "@/lib/api";
import { useTranslation } from "@/i18n/use-translation";

interface Video {
  title: string;
  youtubeId: string;
  thumbnail: string;
  channel: string;
}

type ChapterWithVideosProps = {
  chapters: Chapter[];
  courseTopic: string;
  courseLanguage: string;
  onChapterExpand?: (chapterId: string) => void;
  videos?: Record<string, Video[]>; // Videos by chapter ID
};

export default function ChapterListWithVideos({
  chapters,
  courseTopic,
  courseLanguage,
  onChapterExpand,
  videos = {},
}: ChapterWithVideosProps) {
  const { t } = useTranslation();
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>([]);
  const [selectedVideosByChapter, setSelectedVideosByChapter] = useState<
    Record<string, Video | null>
  >({});

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
        const chapterVideos = videos[chapter.id] || [];
        const selectedVideo =
          selectedVideosByChapter[chapter.id] || chapterVideos[0] || null;

        return (
          <article
            key={chapter.id}
            className="rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:shadow-md overflow-hidden"
          >
            {/* Chapter Header */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    {t("chapter")} {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
                    {chapter.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
                >
                  {t("expand")}
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-slate-200 space-y-4 p-4 sm:p-5 bg-slate-50">
                {/* Chapter Description */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                    Content
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {chapter.explanation}
                  </p>
                </div>

                {/* Videos Section */}
                {chapterVideos.length > 0 && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Play size={16} className="text-red-500" />
                      Related Videos
                    </h4>

                    {/* Video Player */}
                    {selectedVideo && (
                      <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                            title={selectedVideo.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 line-clamp-2">
                            {selectedVideo.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {selectedVideo.channel}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Video Playlist */}
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                      {chapterVideos.map((video) => (
                        <button
                          key={video.youtubeId}
                          onClick={() =>
                            setSelectedVideosByChapter((prev) => ({
                              ...prev,
                              [chapter.id]: video,
                            }))
                          }
                          className={`flex gap-3 p-2 rounded-lg border transition ${
                            selectedVideo?.youtubeId === video.youtubeId
                              ? "border-red-300 bg-red-50"
                              : "border-slate-200 hover:border-red-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex-shrink-0 relative">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-12 h-9 object-cover rounded"
                            />
                            <Play
                              size={12}
                              className="absolute inset-0 m-auto text-white opacity-70"
                            />
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-medium text-slate-900 line-clamp-2">
                              {video.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                              {video.channel}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chapterVideos.length === 0 && (
                  <div className="text-center py-4 px-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-sm text-gray-600">
                      No videos available for this chapter in{" "}
                      {courseLanguage.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
