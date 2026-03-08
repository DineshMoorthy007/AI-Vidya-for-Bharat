/**
 * IndexedDB Utilities for Offline Course Storage
 * Provides functions to save, retrieve, and manage courses locally
 * Uses IndexedDB for efficient client-side storage
 */

// Database configuration
const DB_NAME = "AIVidyaDB";
const DB_VERSION = 1;
const COURSES_STORE = "courses";
const CACHE_STORE = "courseCache";

/**
 * Course interface for storage
 */
export interface StoredCourse {
  id: string;
  title: string;
  description: string;
  chapters: Array<{
    id: string;
    title: string;
    content: string;
    videos?: Array<{
      id: string;
      title: string;
      youtubeId: string;
      thumbnail: string;
      channel: string;
    }>;
  }>;
  thumbnail: string;
  language: string;
  savedAt: number; // Timestamp
  size: number; // Estimated size in bytes
  [key: string]: any; // Allow additional fields
}

/**
 * Initialize IndexedDB database
 * Creates necessary object stores if they don't exist
 * @returns Promise that resolves when DB is initialized
 */
function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Database initialization error:", request.error);
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create courses store
      if (!db.objectStoreNames.contains(COURSES_STORE)) {
        const courseStore = db.createObjectStore(COURSES_STORE, {
          keyPath: "id",
        });
        courseStore.createIndex("savedAt", "savedAt", { unique: false });
      }

      // Create cache store for metadata
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "id" });
      }

      console.log("[IndexedDB] Database upgraded");
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Save a course to IndexedDB
 * @param course Course data to save
 * @returns Promise that resolves when course is saved
 */
export async function saveCourse(course: StoredCourse): Promise<void> {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], "readwrite");
      const store = transaction.objectStore(COURSES_STORE);

      // Add metadata to course
      const courseToSave: StoredCourse = {
        ...course,
        savedAt: Date.now(),
        size: JSON.stringify(course).length,
      };

      const request = store.put(courseToSave);

      request.onerror = () => {
        console.error("Error saving course:", request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        console.log(`[IndexedDB] Course '${course.id}' saved successfully`);
        resolve();
      };

      transaction.onerror = () => {
        console.error("Transaction error:", transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to save course:", error);
    throw error;
  }
}

/**
 * Retrieve a specific course from IndexedDB
 * @param courseId ID of the course to retrieve
 * @returns Promise that resolves with the course or null if not found
 */
export async function getCourse(
  courseId: string,
): Promise<StoredCourse | null> {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], "readonly");
      const store = transaction.objectStore(COURSES_STORE);
      const request = store.get(courseId);

      request.onerror = () => {
        console.error("Error retrieving course:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error("Failed to retrieve course:", error);
    throw error;
  }
}

/**
 * Get all stored courses
 * @returns Promise that resolves with array of all courses
 */
export async function getAllCourses(): Promise<StoredCourse[]> {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], "readonly");
      const store = transaction.objectStore(COURSES_STORE);
      const request = store.getAll();

      request.onerror = () => {
        console.error("Error retrieving all courses:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log(`[IndexedDB] Retrieved ${request.result.length} courses`);
        // Sort by most recently saved
        resolve(
          request.result.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)),
        );
      };
    });
  } catch (error) {
    console.error("Failed to retrieve all courses:", error);
    throw error;
  }
}

/**
 * Delete a course from IndexedDB
 * @param courseId ID of the course to delete
 * @returns Promise that resolves when course is deleted
 */
export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], "readwrite");
      const store = transaction.objectStore(COURSES_STORE);
      const request = store.delete(courseId);

      request.onerror = () => {
        console.error("Error deleting course:", request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        console.log(`[IndexedDB] Course '${courseId}' deleted successfully`);
        resolve();
      };

      transaction.onerror = () => {
        console.error("Transaction error:", transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to delete course:", error);
    throw error;
  }
}

/**
 * Clear all courses from IndexedDB
 * @returns Promise that resolves when all courses are cleared
 */
export async function clearAllCourses(): Promise<void> {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COURSES_STORE], "readwrite");
      const store = transaction.objectStore(COURSES_STORE);
      const request = store.clear();

      request.onerror = () => {
        console.error("Error clearing courses:", request.error);
        reject(request.error);
      };

      transaction.oncomplete = () => {
        console.log("[IndexedDB] All courses cleared");
        resolve();
      };
    });
  } catch (error) {
    console.error("Failed to clear courses:", error);
    throw error;
  }
}

/**
 * Get total storage used by all courses
 * @returns Promise that resolves with total size in bytes
 */
export async function getTotalStorageUsed(): Promise<number> {
  try {
    const courses = await getAllCourses();
    return courses.reduce((total, course) => total + (course.size || 0), 0);
  } catch (error) {
    console.error("Failed to calculate storage usage:", error);
    return 0;
  }
}

/**
 * Check if sufficient storage is available
 * @param requiredBytes Amount of storage needed in bytes
 * @returns Promise that resolves with boolean
 */
export async function hasStorageSpace(requiredBytes: number): Promise<boolean> {
  try {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const available = (estimate.quota || 0) - (estimate.usage || 0);
      return available > requiredBytes;
    }
    // Fallback: assume sufficient space if API not available
    return true;
  } catch (error) {
    console.error("Failed to check storage space:", error);
    return true;
  }
}
