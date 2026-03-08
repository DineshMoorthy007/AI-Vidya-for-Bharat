/**
 * Type Definitions for AI Vidya for Bharat
 * Place in: frontend/src/types/offline.ts or backend/src/types/offline.ts
 *
 * Shared type definitions for offline functionality
 */

/**
 * Video from YouTube API
 */
export interface YouTubeVideo {
  title: string;
  youtubeId: string;
  thumbnail: string;
  channel: string;
  duration?: string;
}

/**
 * Course data structure
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  language: string;
  instructor?: string;
  level?: "beginner" | "intermediate" | "advanced";
  chapters: Chapter[];
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: CourseMetadata;
}

/**
 * Chapter within a course
 */
export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  duration?: number; // in minutes
  videos?: YouTubeVideo[];
  resources?: Resource[];
}

/**
 * Course metadata
 */
export interface CourseMetadata {
  downloadSize?: number;
  lastAccessed?: Date;
  completionPercentage?: number;
  notes?: string;
  favorite?: boolean;
}

/**
 * Learning resource (documents, links, etc.)
 */
export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "link" | "image" | "document";
  url: string;
  size?: number;
}

/**
 * Stored course in IndexedDB
 */
export interface StoredCourseData {
  id: string;
  courseData: Course;
  savedAt: number; // Unix timestamp
  size: number; // Bytes
  expiresAt?: number; // Optional: auto-delete after this timestamp
}

/**
 * Network status state
 */
export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  lastChecked: number; // Unix timestamp
  connType?: "wifi" | "4g" | "3g" | "2g" | "unknown";
}

/**
 * Offline cache state
 */
export interface OfflineCacheState {
  pinnedCourses: string[]; // Course IDs
  totalSize: number; // Bytes
  lastSynced?: number; // Unix timestamp
  pendingSync?: Array<{
    courseId: string;
    action: "pin" | "unpin";
    timestamp: number;
  }>;
}

/**
 * Service Worker message types
 */
export type ServiceWorkerMessage =
  | { type: "CLEAR_CACHE" }
  | { type: "GET_CACHE_STATUS" }
  | { type: "SKIP_WAITING" }
  | { type: "SYNC_COURSES"; payload: { courseIds: string[] } };

/**
 * Service Worker response
 */
export interface ServiceWorkerResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Course state change event
 */
export interface CourseStateChangeEvent {
  type: "coursePinned" | "courseUnpinned" | "courseSynced" | "courseDeleted";
  courseId: string;
  timestamp: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  componentName: string;
  loadTime: number; // milliseconds
  bundleSize?: number; // bytes
  timestamp: number; // Unix timestamp
}

/**
 * API Response format
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: number;
    version: string;
  };
}

/**
 * Video Search API Response
 */
export interface VideoSearchResponse {
  success: boolean;
  chapter: string;
  videos: YouTubeVideo[];
  count: number;
}

/**
 * Course Download Progress
 */
export interface DownloadProgress {
  courseId: string;
  progress: number; // 0-100
  downloaded: number; // bytes
  total: number; // bytes
  status: "downloading" | "completed" | "failed" | "paused";
  error?: string;
}

/**
 * Storage quota info
 */
export interface StorageQuota {
  usage: number; // bytes used
  quota: number; // bytes total
  available: number; // bytes available
  percentage: number; // usage percentage
}

/**
 * Retry options for failed operations
 */
export interface RetryOptions {
  maxAttempts: number;
  delayMs: number; // initial delay
  backoffMultiplier: number; // exponential backoff
}

/**
 * Error response from API
 */
export interface APIError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: number;
}

/**
 * User preferences for offline mode
 */
export interface OfflinePreferences {
  autoDownloadCourses: boolean;
  autoDeleteOldCourses: boolean;
  maxStorageUsed: number; // bytes
  videoQuality: "hd" | "sd" | "low";
  syncOnWiFiOnly: boolean;
}

/**
 * IndexedDB Database schema
 */
export interface IDBSchema {
  courses: {
    key: string; // courseId
    value: StoredCourseData;
  };
  courseCache: {
    key: string; // any cache key
    value: any;
  };
}

/**
 * Validation rules
 */
export namespace Validation {
  export const MAX_COURSE_SIZE = 50 * 1024 * 1024; // 50MB
  export const MAX_STORAGE = 100 * 1024 * 1024; // 100MB
  export const VIDEO_MIN_DURATION = 5 * 60; // 5 minutes in seconds
  export const VIDEO_MAX_DURATION = 20 * 60; // 20 minutes in seconds
  export const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
}
