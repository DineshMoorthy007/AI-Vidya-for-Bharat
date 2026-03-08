/**
 * Video Search Component - Frontend Integration
 * Shows how to fetch and display YouTube videos from the backend API
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

interface VideoSearchResponse {
  success: boolean;
  topic: string;
  language: string;
  videos: Video[];
  count: number;
}

export default function VideoSearchDemo() {
  const [topic, setTopic] = useState("Machine Learning");
  const [language, setLanguage] = useState("en");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search for videos using the backend API
   */
  const searchVideos = async (searchTopic: string, searchLanguage: string) => {
    if (!searchTopic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        buildApiUrl(
          `/api/videos/search?topic=${encodeURIComponent(searchTopic)}&language=${encodeURIComponent(searchLanguage)}`,
        ),
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.statusText}`);
      }

      const data: VideoSearchResponse = await response.json();

      if (data.success) {
        setVideos(data.videos);
        console.log(
          `Found ${data.count} videos for "${data.topic}" (${data.language})`,
        );
      } else {
        throw new Error("API returned unsuccessful response");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search videos");
      console.error("Video search error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchVideos(topic, language);
  };

  /**
   * Open video in YouTube
   */
  const openVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  };

  // Search on component mount
  useEffect(() => {
    searchVideos(topic, language);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        YouTube Video Search Demo
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Search for educational videos based on course topics and languages
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter course topic (e.g., Machine Learning, Python)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Language (e.g., en, hi)"
            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : "Search Videos"}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">❌ Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-gray-600">
            Searching for educational videos...
          </p>
        </div>
      )}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Found {videos.length} educational video
            {videos.length !== 1 ? "s" : ""} for "{chapter}"
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div
                key={video.youtubeId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openVideo(video.youtubeId)}
              >
                {/* Video Thumbnail */}
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-red-600 text-white rounded-full p-3">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{video.channel}</p>
                  <p className="text-xs text-blue-600">
                    Click to watch on YouTube
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Videos Found */}
      {!loading && videos.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Videos Found
          </h3>
          <p className="text-gray-500">
            Try searching for a different chapter or topic.
          </p>
        </div>
      )}

      {/* API Info */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          🔧 API Integration Details
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>API Endpoint:</strong>{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              GET /api/videos/search
            </code>
          </p>
          <p>
            <strong>Parameters:</strong>{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">chapter</code>{" "}
            (required),{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">limit</code>{" "}
            (optional)
          </p>
          <p>
            <strong>Response:</strong> JSON with success, chapter, videos array,
            and count
          </p>
          <p>
            <strong>Video Quality:</strong> Filtered to 5-20 minute educational
            videos
          </p>
          <p>
            <strong>Backend:</strong> Running on http://localhost:3001
          </p>
        </div>
      </div>
    </div>
  );
}
