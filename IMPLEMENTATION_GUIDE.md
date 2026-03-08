# AI Vidya for Bharat - Implementation Guide

## Overview

This guide covers the implementation of key features for offline support, video integration, and performance optimization. All modules are production-ready and designed for low-bandwidth scenarios.

---

## 1. YouTube Video Integration

### File: `backend/src/services/videoSearch.ts`

**Purpose:** Searches for educational videos on YouTube and returns high-quality results.

### Setup Requirements

1. **Get YouTube API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable "YouTube Data API v3"
   - Create an API key (Credentials → API Key)

2. **Set Environment Variable**
   ```bash
   echo "YOUTUBE_API_KEY=your_api_key_here" >> .env.local
   ```

### Usage Example

```typescript
import { searchEducationalVideos } from "@/services/videoSearch";

// Search for videos
const videos = await searchEducationalVideos("Introduction to Mathematics");

// Output:
// [
//   {
//     title: "Math Basics Part 1",
//     youtubeId: "dQw4w9WgXcQ",
//     thumbnail: "https://i.ytimg.com/...",
//     channel: "Educational Channel"
//   },
//   ...
// ]
```

### API Endpoint Example

```typescript
// pages/api/videos/search.ts
import { searchEducationalVideos } from "@/services/videoSearch";

export default async function handler(req, res) {
  const { chapter } = req.query;

  try {
    const videos = await searchEducationalVideos(chapter as string);
    res.status(200).json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## 2. PWA Support

### Files Created

- `frontend/public/manifest.json` - PWA configuration
- `frontend/public/sw.js` - Service Worker

### Setup

1. **Register Service Worker in `app/layout.tsx`**

```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered:', registration);
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

2. **Add Icons**
   Create these icon files in `frontend/public/icons/`:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `icon-maskable-192x192.png` (for adaptive icons)
   - `icon-maskable-512x512.png`

### Features

- **Offline Page Caching**: Core pages cached on install
- **API Response Caching**: Network-first strategy with cache fallback
- **Static Asset Caching**: Cache-first strategy for performance
- **Background Sync**: Syncs offline data when reconnected

---

## 3. Offline Course Storage

### File: `frontend/src/utils/offline/indexedDB.ts`

**Purpose:** Stores courses locally using IndexedDB for offline access.

### Usage Examples

```typescript
import {
  saveCourse,
  getCourse,
  getAllCourses,
  deleteCourse,
} from '@/utils/offline/indexedDB';

// Save a course
await saveCourse({
  id: '123',
  title: 'Python Basics',
  description: 'Learn Python programming',
  chapters: [...],
  thumbnail: 'url',
  language: 'en',
  savedAt: Date.now(),
  size: 1024000,
});

// Retrieve a course
const course = await getCourse('123');

// Get all courses
const courses = await getAllCourses();

// Delete a course
await deleteCourse('123');
```

### Storage Limits

- **Chrome/Edge**: ~50MB per site
- **Firefox**: ~50MB per site
- **Safari**: ~50MB per site
- Check available space: `hasStorageSpace(bytes)`

---

## 4. Course Pinning

### File: `frontend/src/utils/offline/cacheManager.ts`

**Purpose:** Manages saving/removing courses for offline access.

### Usage Examples

```typescript
import {
  pinCourse,
  unpinCourse,
  isCoursePinned,
  getPinnedCourses,
  onCourseStateChange,
} from "@/utils/offline/cacheManager";

// Pin a course for offline access
await pinCourse({
  id: "123",
  title: "Python Basics",
  // ... full course data
});

// Unpin a course
await unpinCourse("123");

// Check if pinned
const isPinned = await isCoursePinned("123");

// Get all pinned courses
const pinned = await getPinnedCourses();

// Subscribe to changes
const unsubscribe = onCourseStateChange((detail) => {
  console.log(detail.type); // 'coursePinned', 'courseUnpinned', 'courseSynced'
  console.log(detail.courseId);
});

// Storage stats
const stats = await getStorageStats();
console.log(stats.pinnedCount, stats.totalSize);
```

### React Hook Usage

```typescript
import { useCoursePinning } from '@/hooks/useOfflineMode';

export function CourseCard({ courseId, courseData }) {
  const { isPinned, togglePin, loading, error } = useCoursePinning(courseId);

  return (
    <button
      onClick={() => togglePin(courseData)}
      disabled={loading}
      className={isPinned ? 'bg-blue-500' : 'bg-gray-300'}
    >
      {loading ? 'Loading...' : isPinned ? 'Saved Offline' : 'Save Offline'}
    </button>
  );
}
```

---

## 5. Network Detection

### File: `frontend/src/utils/networkStatus.ts`

**Purpose:** Detects online/offline state and provides network status callbacks.

### Usage Examples

```typescript
import {
  isOnline,
  isOffline,
  onNetworkChange,
  waitForConnectivity,
  verifyConnectivity,
} from "@/utils/networkStatus";

// Check current status
console.log(isOnline()); // true or false

// Subscribe to changes
const unsubscribe = onNetworkChange((isOnline) => {
  console.log(`Network is now ${isOnline ? "online" : "offline"}`);
});

// Wait for connectivity
try {
  await waitForConnectivity(30000); // 30 second timeout
  console.log("Back online!");
} catch {
  console.log("Timeout waiting for connection");
}

// Verify connectivity with server check
const hasConnection = await verifyConnectivity();
```

### React Hook Usage

```typescript
import { useNetworkAwareComponent } from '@/hooks/useOfflineMode';

export function VideoComponent() {
  const { shouldLoadHeavy, useCache, getVideoQuality, isOnline } =
    useNetworkAwareComponent();

  return (
    <div>
      {isOnline ? (
        <HeavyVideoPlayer quality={getVideoQuality()} />
      ) : (
        <CachedVideoThumbnail />
      )}

      {!isOnline && (
        <div className="banner">Offline Mode - Using Cached Data</div>
      )}
    </div>
  );
}
```

---

## 6. Performance Optimizations

### Dynamic Component Imports

#### File: `frontend/src/utils/dynamicComponentLoader.ts`

```typescript
import { createDynamicComponent } from '@/utils/dynamicComponentLoader';

// Heavy video player component
const VideoPlayer = createDynamicComponent(
  () => import('@/components/VideoPlayer'),
  { ssr: false }
);

// Use in pages
export default function CoursePage() {
  return (
    <div>
      <h1>Course Title</h1>
      <VideoPlayer videoId="abc123" /> {/* Lazy loads */}
    </div>
  );
}
```

#### Preloading Strategy

```typescript
import { preloadComponent } from '@/utils/dynamicComponentLoader';

export function CourseCard({ courseId }) {
  return (
    <button
      onMouseEnter={() => {
        // Preload video player when hovering
        preloadComponent(() => import('@/components/VideoPlayer'));
      }}
    >
      View Course
    </button>
  );
}
```

---

## 7. Complete Integration Example

### Course Page with All Features

```typescript
'use client';

import dynamic from 'next/dynamic';
import { useCoursePinning, useOfflineMode } from '@/hooks/useOfflineMode';
import { useNetworkAwareComponent } from '@/hooks/useOfflineMode';

// Lazy load heavy component
const RecommendedVideos = dynamic(
  () => import('@/components/RecommendedVideosOptimized'),
  { loading: () => <div>Loading videos...</div> }
);

export default function CoursePage({ params }: { params: { id: string } }) {
  const { isPinned, togglePin } = useCoursePinning(params.id);
  const { isOnline } = useOfflineMode();
  const { shouldLoadHeavy } = useNetworkAwareComponent();

  const course = {
    id: params.id,
    title: 'Python Basics',
    chapters: [...],
    // ... more data
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>{course.title}</h1>

        {/* Pin/Unpin Button */}
        <button
          onClick={() => togglePin(course)}
          className={`px-4 py-2 rounded ${
            isPinned ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          {isPinned ? '✓ Saved Offline' : 'Save Offline'}
        </button>
      </div>

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          You are offline. Viewing cached version.
        </div>
      )}

      {/* Course Content */}
      <div className="course-content">
        {course.chapters.map((chapter) => (
          <div key={chapter.id}>
            <h2>{chapter.title}</h2>
            <p>{chapter.content}</p>

            {/* Lazy load videos only when online */}
            {shouldLoadHeavy && (
              <RecommendedVideos
                chapterTitle={chapter.title}
                chapterId={chapter.id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Environment Variables

Create `.env.local` in the backend:

```env
# YouTube Integration
YOUTUBE_API_KEY=your_api_key_here

# Database
DATABASE_URL=your_database_url

# API
BASE_URL=http://localhost:3001
```

---

## 9. Testing Offline Mode

### Browser DevTools

1. Open DevTools (F12)
2. Go to **Application** → **Service Workers**
3. Check "Offline" to simulate offline mode
4. Test functionality without network

### Network Throttling

1. DevTools → **Network** tab
2. Select "Slow 3G" or custom speed
3. Test with limited bandwidth

### IndexedDB Inspection

1. DevTools → **Application** → **IndexedDB**
2. Expand "AIVidyaDB" to view stored courses
3. Check storage size

---

## 10. Production Checklist

- [ ] YouTube API key configured
- [ ] Service Worker registered in app
- [ ] All manifest icons created
- [ ] IndexedDB tested in multiple browsers
- [ ] Network detection tested (offline/online)
- [ ] Course pinning tested
- [ ] Dynamic imports working
- [ ] PWA installable on mobile
- [ ] Error handling for failed requests
- [ ] Analytics integration for metrics
- [ ] Security headers configured
- [ ] CORS properly set up

---

## 11. Browser Support

| Feature        | Chrome | Firefox | Safari     | Edge |
| -------------- | ------ | ------- | ---------- | ---- |
| Service Worker | ✅     | ✅      | ✅ (11.1+) | ✅   |
| IndexedDB      | ✅     | ✅      | ✅         | ✅   |
| PWA            | ✅     | ✅      | ✅ (11.3+) | ✅   |
| Dynamic Import | ✅     | ✅      | ✅         | ✅   |
| Network API    | ✅     | ✅      | ✅ (14+)   | ✅   |

---

## Support

For issues or questions:

1. Check the inline code comments
2. Review error logs in browser console
3. Test in DevTools offline mode
4. Check IndexedDB storage
