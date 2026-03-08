/**
 * Cache Manager for Course Pinning
 * Manages saving and removing courses for offline access
 * Integrates with IndexedDB for persistent storage
 */

import {
  saveCourse,
  deleteCourse,
  getCourse,
  getAllCourses,
  hasStorageSpace,
  StoredCourse,
} from "./indexedDB";

// LocalStorage key for tracking pinned courses
const PINNED_COURSES_KEY = "ai-vidya-pinned-courses";

/**
 * Get list of pinned course IDs from LocalStorage
 * @returns Array of pinned course IDs
 */
function getPinnedCourseIds(): Set<string> {
  try {
    const stored = localStorage.getItem(PINNED_COURSES_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

/**
 * Save pinned course IDs to LocalStorage
 * @param courseIds Set of pinned course IDs
 */
function savePinnedCourseIds(courseIds: Set<string>): void {
  try {
    localStorage.setItem(
      PINNED_COURSES_KEY,
      JSON.stringify(Array.from(courseIds)),
    );
  } catch (error) {
    console.error("Failed to save pinned course IDs:", error);
  }
}

/**
 * Pin a course for offline access
 * Downloads course data and stores it in IndexedDB
 * @param courseData Course data to pin
 * @returns Promise that resolves when course is pinned
 */
export async function pinCourse(courseData: StoredCourse): Promise<void> {
  try {
    // Validate course data
    if (!courseData.id || !courseData.title) {
      throw new Error("Invalid course data: missing id or title");
    }

    // Check available storage
    const estimatedSize = JSON.stringify(courseData).length;
    const hasSpace = await hasStorageSpace(estimatedSize);

    if (!hasSpace) {
      throw new Error(
        "Insufficient storage space. Please free up space and try again.",
      );
    }

    // Save to IndexedDB
    await saveCourse(courseData);

    // Update pinned courses list
    const pinnedIds = getPinnedCourseIds();
    pinnedIds.add(courseData.id);
    savePinnedCourseIds(pinnedIds);

    console.log(
      `[Cache Manager] Course '${courseData.id}' pinned successfully`,
    );

    // Broadcast event for UI updates
    broadcastCourseStateChange("coursePinned", courseData.id);
  } catch (error) {
    console.error("Failed to pin course:", error);
    throw error;
  }
}

/**
 * Unpin a course (remove from offline storage)
 * @param courseId ID of the course to unpin
 * @returns Promise that resolves when course is unpinned
 */
export async function unpinCourse(courseId: string): Promise<void> {
  try {
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    // Delete from IndexedDB
    await deleteCourse(courseId);

    // Update pinned courses list
    const pinnedIds = getPinnedCourseIds();
    pinnedIds.delete(courseId);
    savePinnedCourseIds(pinnedIds);

    console.log(`[Cache Manager] Course '${courseId}' unpinned successfully`);

    // Broadcast event for UI updates
    broadcastCourseStateChange("courseUnpinned", courseId);
  } catch (error) {
    console.error("Failed to unpin course:", error);
    throw error;
  }
}

/**
 * Check if a course is pinned
 * @param courseId ID of the course to check
 * @returns Promise that resolves with boolean
 */
export async function isCoursePinned(courseId: string): Promise<boolean> {
  try {
    if (!courseId) {
      return false;
    }

    const pinnedIds = getPinnedCourseIds();
    const isPinned = pinnedIds.has(courseId);

    // Double-check in IndexedDB
    if (isPinned) {
      const course = await getCourse(courseId);
      return !!course;
    }

    return false;
  } catch (error) {
    console.error("Failed to check if course is pinned:", error);
    return false;
  }
}

/**
 * Get all pinned courses
 * @returns Promise that resolves with array of pinned courses
 */
export async function getPinnedCourses(): Promise<StoredCourse[]> {
  try {
    const pinnedIds = getPinnedCourseIds();

    if (pinnedIds.size === 0) {
      return [];
    }

    const allCourses = await getAllCourses();
    return allCourses.filter((course) => pinnedIds.has(course.id));
  } catch (error) {
    console.error("Failed to get pinned courses:", error);
    return [];
  }
}

/**
 * Get count of pinned courses
 * @returns Promise that resolves with number of pinned courses
 */
export async function getPinnedCoursesCount(): Promise<number> {
  try {
    const pinnedCourses = await getPinnedCourses();
    return pinnedCourses.length;
  } catch (error) {
    console.error("Failed to get pinned courses count:", error);
    return 0;
  }
}

/**
 * Sync pinned courses: updates stored courses with latest data
 * Useful when API has updated course content
 * @param updatedCourse Updated course data
 * @returns Promise that resolves when course is synced
 */
export async function syncPinnedCourse(
  updatedCourse: StoredCourse,
): Promise<void> {
  try {
    if (!updatedCourse.id) {
      throw new Error("Course ID is required");
    }

    const isPinned = await isCoursePinned(updatedCourse.id);
    if (!isPinned) {
      throw new Error(`Course '${updatedCourse.id}' is not pinned`);
    }

    // Update the course in IndexedDB
    await saveCourse(updatedCourse);
    console.log(
      `[Cache Manager] Course '${updatedCourse.id}' synced successfully`,
    );

    // Broadcast event
    broadcastCourseStateChange("courseSynced", updatedCourse.id);
  } catch (error) {
    console.error("Failed to sync pinned course:", error);
    throw error;
  }
}

/**
 * Get storage stats for pinned courses
 * @returns Promise that resolves with storage stats
 */
export async function getStorageStats(): Promise<{
  pinnedCount: number;
  totalSize: number;
  courses: Array<{
    id: string;
    title: string;
    size: number;
    savedAt: number;
  }>;
}> {
  try {
    const pinnedCourses = await getPinnedCourses();
    const totalSize = pinnedCourses.reduce(
      (sum, course) => sum + (course.size || 0),
      0,
    );

    return {
      pinnedCount: pinnedCourses.length,
      totalSize,
      courses: pinnedCourses.map((course) => ({
        id: course.id,
        title: course.title,
        size: course.size || 0,
        savedAt: course.savedAt || 0,
      })),
    };
  } catch (error) {
    console.error("Failed to get storage stats:", error);
    return {
      pinnedCount: 0,
      totalSize: 0,
      courses: [],
    };
  }
}

/**
 * Broadcast custom events for course state changes
 * Allows components to subscribe to changes
 * @param eventType Type of event
 * @param courseId ID of affected course
 */
function broadcastCourseStateChange(eventType: string, courseId: string): void {
  try {
    const event = new CustomEvent("courseStateChange", {
      detail: {
        type: eventType,
        courseId,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Failed to broadcast event:", error);
  }
}

/**
 * Subscribe to course state changes
 * @param callback Function to call when course state changes
 * @returns Cleanup function to unsubscribe
 */
export function onCourseStateChange(
  callback: (detail: {
    type: string;
    courseId: string;
    timestamp: number;
  }) => void,
): () => void {
  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail);
    }
  };

  window.addEventListener("courseStateChange", handler);

  // Return cleanup function
  return () => {
    window.removeEventListener("courseStateChange", handler);
  };
}
