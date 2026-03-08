/**
 * Video Recommendations for Course Chapters
 * Shows how to integrate YouTube video search into course chapters
 */

"use client";

import { useState, useEffect } from "react";
import { buildApiUrl } from "@/lib/api";

interface Video {
  title: string;
  youtubeId: string;
  thumbnail: string;
  channel: string;
}

interface ChapterVideoRecommendationsProps {
  chapterTitle: string;
  chapterId: string;
  courseTopic: string;
  courseLanguage: string;
  onVideoSelect?: (video: Video) => void;
}

export default function ChapterVideoRecommendations({
  chapterTitle,
  chapterId,
  courseTopic,
  courseLanguage,
  onVideoSelect,
}: ChapterVideoRecommendationsProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch video recommendations for this chapter
   */
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call your backend API with course topic and language
        const response = await fetch(
          buildApiUrl(
            `/api/videos/search?topic=${encodeURIComponent(courseTopic)}&language=${encodeURIComponent(courseLanguage)}&limit=3`,
          ),
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          setVideos(data.videos);
        } else {
          throw new Error("Failed to get video recommendations");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
        console.error("Video fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseTopic) {
      fetchVideos();
    }
  }, [courseTopic, courseLanguage, chapterId]);

  /**
   * Handle video click
   */
  const handleVideoClick = (video: Video) => {
    // Open in new tab
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, "_blank");

    // Call optional callback
    onVideoSelect?.(video);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-blue-700">Finding educational videos...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-700 text-sm">
          ⚠️ Could not load video recommendations: {error}
        </p>
      </div>
    );
  }

  // No videos found
  if (videos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600 text-sm">
          📚 No video recommendations found for this chapter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-red-500">🎥</span>
        Recommended Videos for "{chapterTitle}"
      </h4>

      <div className="space-y-3">
        {videos.map((video) => (
          <div
            key={video.youtubeId}
            onClick={() => handleVideoClick(video)}
            className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            {/* Thumbnail */}
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-20 h-15 object-cover rounded flex-shrink-0"
              loading="lazy"
            />

            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-gray-900 line-clamp-2 text-sm">
                {video.title}
              </h5>
              <p className="text-xs text-gray-600 mt-1">{video.channel}</p>
              <p className="text-xs text-blue-600 mt-1">
                Click to watch on YouTube →
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 These videos are 5-20 minutes long and selected for educational
          quality.
        </p>
      </div>
    </div>
  );
}
