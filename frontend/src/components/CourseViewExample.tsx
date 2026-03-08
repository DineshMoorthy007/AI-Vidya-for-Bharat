/**
 * Course View Component - Complete Example
 * Demonstrates integration of all offline and performance features
 * Shows best practices for video integration and course pinning
 */

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  useCoursePinning,
  useNetworkAwareComponent,
  useOfflineMode,
} from "@/hooks/useOfflineMode";
import { StoredCourse } from "@/utils/offline/indexedDB";

// Lazy load the recommended videos component
const RecommendedVideos = dynamic(
  () => import("@/components/RecommendedVideosOptimized"),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-300 h-32 rounded"></div>
      </div>
    ),
  },
);

// Lazy load chapter video recommendations
const ChapterVideoRecommendations = dynamic(
  () => import("@/components/ChapterVideoRecommendations"),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4">
        <div className="bg-gray-300 h-4 rounded w-1/3 mb-3"></div>
        <div className="bg-gray-300 h-16 rounded"></div>
      </div>
    ),
  },
);

/**
 * Course interface
 */
interface Course {
  id: string;
  title: string;
  topic: string;
  language: string;
  description: string;
  thumbnail: string;
  chapters: Chapter[];
  instructor?: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  duration?: number;
}

/**
 * Props for the component
 */
interface CourseViewProps {
  coursePath: string; // or however the course is identified
}

/**
 * Main Course View Component
 * Features:
 * - Network-aware rendering
 * - Course pinning/offline download
 * - Lazy-loaded video recommendations
 * - Responsive design
 */
export default function CourseView({ coursePath }: CourseViewProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const {
    isPinned,
    togglePin,
    loading: pinLoading,
    error: pinError,
  } = useCoursePinning(course?.id || "");
  const { isOnline, isOffline } = useOfflineMode();
  const { shouldLoadHeavy, getVideoQuality } = useNetworkAwareComponent();

  /**
   * Load course data from API
   */
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${coursePath}`);

        if (!response.ok) {
          throw new Error(`Failed to load course: ${response.statusText}`);
        }

        const data = await response.json();
        setCourse(data.course);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
        console.error("Course load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [coursePath]);

  /**
   * Handle course pinning
   */
  const handleTogglePin = async () => {
    if (!course) return;

    try {
      const courseData: StoredCourse = {
        id: course.id,
        title: course.title,
        description: course.description,
        chapters: course.chapters,
        thumbnail: course.thumbnail,
        language: course.language,
        savedAt: Date.now(),
        size: JSON.stringify(course).length,
      };

      const success = await togglePin(courseData);

      if (success) {
        console.log(`Course ${isPinned ? "unpinned" : "pinned"}`);
      }
    } catch (err) {
      console.error("Toggle pin error:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-300 h-64 rounded-lg"></div>
          <div className="bg-gray-300 h-12 rounded w-3/4"></div>
          <div className="bg-gray-300 h-6 rounded w-full"></div>
          <div className="bg-gray-300 h-6 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">
            Error Loading Course
          </h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Network Status Banner */}
      {isOffline && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center gap-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Offline Mode</p>
              <p className="text-yellow-700 text-sm">
                {isPinned
                  ? "You are viewing a downloaded copy of this course."
                  : "You are offline. Some features may be limited."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Course Header */}
      <div className="mb-8">
        {/* Course Thumbnail */}
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            loading="lazy"
            className="w-full h-64 object-cover rounded-lg mb-6 shadow-md"
          />
        )}

        {/* Course Title and Actions */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {course.title}
            </h1>
            {course.instructor && (
              <p className="text-gray-600">Instructor: {course.instructor}</p>
            )}
          </div>

          {/* Pin/Save Offline Button */}
          <button
            onClick={handleTogglePin}
            disabled={pinLoading || !isOnline}
            className={`px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              isPinned
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            } ${pinLoading || !isOnline ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {pinLoading
              ? "Loading..."
              : isPinned
                ? "✓ Saved Offline"
                : "Save Offline"}
          </button>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-700 leading-relaxed">
          {course.description}
        </p>

        {pinError && <p className="text-red-600 text-sm mt-2">{pinError}</p>}
      </div>

      {/* Chapters Section */}
      <div className="space-y-8">
        {course.chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="border-b border-gray-200 pb-8 last:border-b-0"
          >
            {/* Chapter Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                {chapter.title}
              </h2>
              {chapter.duration && (
                <p className="text-sm text-gray-600">
                  Duration: {chapter.duration} minutes
                </p>
              )}
            </div>

            {/* Chapter Content */}
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-gray-700">{chapter.content}</p>
            </div>

            {/* Video Recommendations - New API-based component */}
            <div className="mb-6">
              <ChapterVideoRecommendations
                chapterTitle={chapter.title}
                chapterId={chapter.id}
                courseTopic={course.topic}
                courseLanguage={course.language}
                onVideoSelect={(video) => {
                  console.log("Selected video:", video);
                  // You can add analytics tracking here
                  // trackVideoView(video.youtubeId, chapter.id);
                }}
              />
            </div>

            {/* Recommended Videos - Only load when online */}
            {shouldLoadHeavy && (
              <div className="bg-gray-50 rounded-lg p-6">
                <RecommendedVideos
                  chapterTitle={chapter.title}
                  chapterId={chapter.id}
                  onVideoSelect={(video) => {
                    console.log("Selected video:", video);
                    // Handle video selection
                  }}
                />
              </div>
            )}

            {/* Offline Video Notice */}
            {isOffline && !shouldLoadHeavy && (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">
                  Videos are not available in offline mode. Go online to watch
                  recommendations.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Storage Info (when pinned) */}
      {isPinned && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 text-sm">
            ✓ This course is saved offline. You can access it without an
            internet connection.
          </p>
        </div>
      )}
    </div>
  );
}
