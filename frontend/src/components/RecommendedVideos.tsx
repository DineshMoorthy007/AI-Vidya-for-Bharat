import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/use-translation";
import { buildApiUrl } from "@/lib/api";

type Video = {
  title: string;
  youtubeId: string;
  thumbnail: string;
  channel: string;
};

interface RecommendedVideosProps {
  topic: string;
  chapterTitles: string[];
  language: string;
}

const YOUTUBE_LANGUAGE_HINTS: Record<string, string> = {
  en: "english",
  hi: "hindi",
  ta: "tamil",
  te: "telugu",
  kn: "kannada",
};

function toSearchLink(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export default function RecommendedVideos({
  topic,
  chapterTitles,
  language,
}: RecommendedVideosProps) {
  const { t } = useTranslation();
  const languageHint = YOUTUBE_LANGUAGE_HINTS[language] ?? language;

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetch videos from backend API when course topic/language change
  useEffect(() => {
    const fetchVideos = async () => {
      if (!topic) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          buildApiUrl(
            `/api/videos/search?topic=${encodeURIComponent(topic)}&language=${encodeURIComponent(language)}`,
          ),
        );
        if (!res.ok) {
          throw new Error(`Request failed: ${res.statusText}`);
        }
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [topic, language]);

  const renderFallbackLinks = () => {
    const recommendations = [
      {
        title: t("videoIntroToTopic", { topic }),
        link: toSearchLink(`${topic} ${languageHint} tutorial introduction`),
      },
      {
        title: chapterTitles[0]
          ? t("videoExplainedChapter", { chapter: chapterTitles[0] })
          : t("videoExplainedTopic", { topic }),
        link: toSearchLink(
          chapterTitles[0]
            ? `${chapterTitles[0]} ${languageHint} tutorial`
            : `${topic} ${languageHint} explanation tutorial`,
        ),
      },
      {
        title: t("videoPracticeForTopic", { topic }),
        link: toSearchLink(
          `${topic} ${languageHint} practice problems tutorial`,
        ),
      },
    ];

    return (
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((video) => (
          <Link
            key={video.title}
            href={video.link}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            {video.title}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        {t("recommendedVideos")}
      </h2>
      {loading && <p className="mt-4 text-gray-500">{t("loading")}...</p>}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{t("videoFetchError", { error })}</p>
        </div>
      )}
      {!loading && !error && videos.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <button
              key={video.youtubeId}
              onClick={() =>
                window.open(
                  `https://www.youtube.com/watch?v=${video.youtubeId}`,
                  "_blank",
                )
              }
              className="group block text-left bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative overflow-hidden bg-gray-200 aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">
                  {video.title}
                </p>
                <p className="text-xs text-gray-600">{video.channel}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        !loading && renderFallbackLinks()
      )}
    </section>
  );
}
