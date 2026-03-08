/**
 * Recommended Videos Component with Dynamic Import
 * Example of performance optimization using lazy loading
 * The RecommendedVideos component itself is lazy-loaded
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Video data interface
 */
interface Video {
  id: string;
  title: string;
  youtubeId: string;
  thumbnail: string;
  channel: string;
  duration?: string;
}

/**
 * Component props
 */
interface RecommendedVideosProps {
  chapterTitle: string;
  chapterId: string;
  onVideoSelect?: (video: Video) => void;
}

/**
 * RecommendedVideos Component
 * Displays recommended YouTube videos for a chapter
 * This component can be lazy-loaded using dynamic imports
 *
 * Usage:
 * const RecommendedVideos = dynamic(
 *   () => import('../components/RecommendedVideosOptimized'),
 *   { loading: () => <LoadingComponent /> }
 * );
 */
export const RecommendedVideosOptimized: React.FC<RecommendedVideosProps> = ({
  chapterTitle,
  chapterId,
  onVideoSelect,
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch recommended videos for the chapter
   */
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/videos/search?chapter=${encodeURIComponent(chapterTitle)}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }

        const data = await response.json();
        setVideos(data.videos || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
        console.error("Error fetching recommended videos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (chapterTitle) {
      fetchVideos();
    }
  }, [chapterTitle, chapterId]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 h-40 rounded-lg mb-3"></div>
            <div className="bg-gray-300 h-6 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading videos: {error}</p>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700">No videos found for this chapter</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Recommended Videos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => onVideoSelect?.(video)}
            className="group block text-left bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-200"
          >
            {/* Video Thumbnail */}
            <div className="relative overflow-hidden bg-gray-200 aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-3">
              <p className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">
                {video.title}
              </p>
              <p className="text-xs text-gray-600">{video.channel}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecommendedVideosOptimized;
