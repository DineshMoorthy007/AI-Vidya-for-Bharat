/**
 * Video Modal Component
 * Displays topic-wise videos in an expandable modal on the same page
 */

"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Play } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

interface Video {
  title: string;
  youtubeId: string;
  thumbnail: string;
  channel: string;
}

interface VideoModalProps {
  topic: string;
  language: string;
  onClose?: () => void;
}

export default function VideoModal({
  topic,
  language,
  onClose,
}: VideoModalProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          buildApiUrl(
            `/api/videos/search?topic=${encodeURIComponent(topic)}&language=${encodeURIComponent(language)}&limit=5`,
          ),
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.videos) {
          setVideos(data.videos);
          if (data.videos.length > 0) {
            setSelectedVideo(data.videos[0]);
          }
        } else {
          throw new Error("Failed to get video data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
        console.error("Video fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (topic && language) {
      fetchVideos();
    }
  }, [topic, language]);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Related Videos for {topic}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-100 rounded-md transition"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-900">
            Unable to Load Videos
          </h3>
          <span className="text-sm text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          No Videos Available
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          No educational videos found for this topic.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Play size={20} className="text-red-500" />
              Videos: {topic}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Language:{" "}
              <span className="font-medium text-slate-800">
                {language.toUpperCase()}
              </span>{" "}
              • {videos.length} videos available
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white rounded-md transition"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-md transition"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Video Player */}
          {selectedVideo && (
            <div className="space-y-3">
              <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
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
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 text-base">
                  {selectedVideo.title}
                </h4>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                  {selectedVideo.channel}
                </p>
              </div>
            </div>
          )}

          {/* Playlist */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">
              Suggested Videos
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {videos.map((video) => (
                <button
                  key={video.youtubeId}
                  onClick={() => setSelectedVideo(video)}
                  className={`flex gap-3 p-3 rounded-lg border transition ${
                    selectedVideo?.youtubeId === video.youtubeId
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-red-300 hover:bg-slate-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <Play
                      size={16}
                      className="absolute inset-0 m-auto text-white opacity-70"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {video.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {video.channel}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  {selectedVideo?.youtubeId === video.youtubeId && (
                    <div className="flex-shrink-0 flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
