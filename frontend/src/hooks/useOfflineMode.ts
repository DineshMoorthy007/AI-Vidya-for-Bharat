/**
 * useOfflineMode Hook
 * React hook for managing offline functionality and course pinning
 * Provides network awareness and local storage integration
 */

import { useEffect, useState, useCallback } from "react";
import { isOnline, onNetworkChange } from "@/utils/networkStatus";
import {
  pinCourse,
  unpinCourse,
  isCoursePinned,
  getPinnedCourses,
  getStorageStats,
  onCourseStateChange,
} from "@/utils/offline/cacheManager";
import { StoredCourse } from "@/utils/offline/indexedDB";

/**
 * Offline mode and course management state
 */
interface OfflineModeState {
  isOnline: boolean;
  isOffline: boolean;
  pinnedCourses: StoredCourse[];
  storageStats: {
    pinnedCount: number;
    totalSize: number;
  };
  loading: boolean;
}

/**
 * useOfflineMode Hook
 * Manages offline mode state and course pinning
 *
 * @example
 * const { isOnline, pinnedCourses, pinCourse } = useOfflineMode();
 *
 * @returns Object with offline state and course management functions
 */
export function useOfflineMode() {
  const [state, setState] = useState<OfflineModeState>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isOffline: false,
    pinnedCourses: [],
    storageStats: { pinnedCount: 0, totalSize: 0 },
    loading: true,
  });

  const [coursePin, setCoursePin] = useState<Map<string, boolean>>(new Map());

  /**
   * Load initial offline state
   */
  useEffect(() => {
    const loadOfflineState = async () => {
      try {
        const pinnedCourses = await getPinnedCourses();
        const stats = await getStorageStats();

        setState((prev) => ({
          ...prev,
          pinnedCourses,
          storageStats: {
            pinnedCount: stats.pinnedCount,
            totalSize: stats.totalSize,
          },
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to load offline state:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    loadOfflineState();
  }, []);

  /**
   * Subscribe to network changes
   */
  useEffect(() => {
    const unsubscribe = onNetworkChange((isNetOnline) => {
      setState((prev) => ({
        ...prev,
        isOnline: isNetOnline,
        isOffline: !isNetOnline,
      }));

      console.log(
        `[useOfflineMode] Network status: ${isNetOnline ? "ONLINE" : "OFFLINE"}`,
      );
    });

    return unsubscribe;
  }, []);

  /**
   * Subscribe to course state changes
   */
  useEffect(() => {
    const unsubscribe = onCourseStateChange(async (detail) => {
      // Refresh pinned courses when state changes
      const pinnedCourses = await getPinnedCourses();
      const stats = await getStorageStats();

      setState((prev) => ({
        ...prev,
        pinnedCourses,
        storageStats: {
          pinnedCount: stats.pinnedCount,
          totalSize: stats.totalSize,
        },
      }));
    });

    return unsubscribe;
  }, []);

  /**
   * Pin a course for offline access
   */
  const handlePinCourse = useCallback(
    async (course: StoredCourse): Promise<boolean> => {
      try {
        await pinCourse(course);
        setCoursePin((prev) => new Map(prev).set(course.id, true));
        return true;
      } catch (error) {
        console.error("Failed to pin course:", error);
        return false;
      }
    },
    [],
  );

  /**
   * Unpin a course from offline storage
   */
  const handleUnpinCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      try {
        await unpinCourse(courseId);
        setCoursePin((prev) => {
          const copy = new Map(prev);
          copy.delete(courseId);
          return copy;
        });
        return true;
      } catch (error) {
        console.error("Failed to unpin course:", error);
        return false;
      }
    },
    [],
  );

  /**
   * Check if specific course is pinned
   */
  const handleIsCoursePinned = useCallback(
    async (courseId: string): Promise<boolean> => {
      try {
        const pinned = await isCoursePinned(courseId);
        setCoursePin((prev) => new Map(prev).set(courseId, pinned));
        return pinned;
      } catch (error) {
        console.error("Failed to check if course is pinned:", error);
        return false;
      }
    },
    [],
  );

  return {
    // Network status
    isOnline: state.isOnline,
    isOffline: state.isOffline,

    // Course management
    pinnedCourses: state.pinnedCourses,
    storageStats: state.storageStats,

    // Methods
    pinCourse: handlePinCourse,
    unpinCourse: handleUnpinCourse,
    isCoursePinned: handleIsCoursePinned,

    // State
    loading: state.loading,
  };
}

/**
 * useNetworkAwareComponent Hook
 * Manages component behavior based on network status
 * Shows different UI for online/offline modes
 *
 * @example
 * const { shouldLoadHeavy, fallbackComponent } = useNetworkAwareComponent();
 *
 * @returns Object with network awareness helpers
 */
export function useNetworkAwareComponent() {
  const [isOnlineState, setIsOnlineState] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange((isNetOnline) => {
      setIsOnlineState(isNetOnline);
    });

    return unsubscribe;
  }, []);

  return {
    /**
     * Should load heavy components (videos, large images, etc.)
     * Only load if user is online
     */
    shouldLoadHeavy: isOnlineState,

    /**
     * Should show cached/simplified version
     */
    useCache: !isOnlineState,

    /**
     * Get appropriate quality based on connection
     */
    getVideoQuality: (): "hd" | "sd" | "low" => {
      if (!isOnlineState) return "low";
      // Could integrate with navigator.connection API for more detailed detection
      return "hd";
    },

    /**
     * Should show sync warning
     */
    showSyncWarning: !isOnlineState,

    isOnline: isOnlineState,
  };
}

/**
 * useCoursePinning Hook
 * Simplified hook for course pinning operations
 *
 * @example
 * const { isPinned, togglePin, error } = useCoursePinning(courseId);
 *
 * @returns Hook for course pinning
 */
export function useCoursePinning(courseId: string) {
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offlineMode = useOfflineMode();

  /**
   * Check initial pin status
   */
  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        setLoading(true);
        const pinned = await offlineMode.isCoursePinned(courseId);
        setIsPinned(pinned);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to check pin status",
        );
      } finally {
        setLoading(false);
      }
    };

    checkPinStatus();
  }, [courseId, offlineMode]);

  /**
   * Toggle pin status
   */
  const togglePin = useCallback(
    async (courseData?: StoredCourse): Promise<boolean> => {
      try {
        setError(null);
        if (isPinned) {
          const success = await offlineMode.unpinCourse(courseId);
          if (success) {
            setIsPinned(false);
          }
          return success;
        } else {
          if (!courseData) {
            setError("Course data is required to pin");
            return false;
          }
          const success = await offlineMode.pinCourse(courseData);
          if (success) {
            setIsPinned(true);
          }
          return success;
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Operation failed";
        setError(errorMsg);
        return false;
      }
    },
    [isPinned, courseId, offlineMode],
  );

  return {
    isPinned,
    loading,
    error,
    togglePin,
  };
}
