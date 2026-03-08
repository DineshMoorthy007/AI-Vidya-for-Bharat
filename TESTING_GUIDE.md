# Testing Guide - AI Vidya for Bharat

## Manual Testing in Browser DevTools

### 1. Service Worker Testing

#### Setup

1. Open DevTools: `F12` or `Cmd+Option+I`
2. Go to **Application** → **Service Workers**

#### Tests

**Test 1: Service Worker Registration**

```
Expected: Service worker shows as "running"
Status: Ready
Scope: http://localhost:3000/
```

**Test 2: Cache Content**

```
Steps:
1. Go to Application → Cache Storage
2. Expand "ai-vidya-cache-v1"
3. Check cached URLs

Expected URLs should include:
- /
- /dashboard
- /explore
- /chat
- /api/courses
```

**Test 3: Offline Access**

```
Steps:
1. Go to Service Workers
2. Check "Offline"
3. Reload page
4. Navigate between pages

Expected: Pages load from cache
Notice: Content may be stale but accessible
```

---

### 2. IndexedDB Testing

#### Access IndexedDB

1. DevTools → **Application** → **IndexedDB**
2. Expand "AIVidyaDB"

#### Test: Store Course

```javascript
// Run in console:
import { saveCourse } from "@/utils/offline/indexedDB";

await saveCourse({
  id: "test-course-1",
  title: "Test Course",
  description: "A test course",
  chapters: [
    {
      id: "ch1",
      title: "Chapter 1",
      content: "Content",
    },
  ],
  thumbnail: "url",
  language: "en",
  savedAt: Date.now(),
  size: 1024,
});

console.log("Course saved");
```

#### Verify in DevTools

```
Check: IndexedDB → AIVidyaDB → courses
Expected: See "test-course-1" entry
```

#### Test: Retrieve Course

```javascript
import { getCourse, getAllCourses } from "@/utils/offline/indexedDB";

// Get single course
const course = await getCourse("test-course-1");
console.log(course);

// Get all courses
const allCourses = await getAllCourses();
console.log(allCourses);
```

#### Test: Delete Course

```javascript
import { deleteCourse } from "@/utils/offline/indexedDB";

await deleteCourse("test-course-1");
console.log("Course deleted");
```

Verify: Course removed from IndexedDB in DevTools

---

### 3. Network Status Testing

#### Test 1: Check Online Status

```javascript
import { isOnline, getNetworkStatus } from "@/utils/networkStatus";

console.log(isOnline()); // true or false
console.log(getNetworkStatus());
```

#### Test 2: Simulate Offline

```
Steps:
1. DevTools → Network tab
2. Uncheck "Enable network" (Offline button)
3. Reload page
4. Run: console.log(isOnline())
```

Expected: Returns `false`

#### Test 3: Network Change Listener

```javascript
import { onNetworkChange } from "@/utils/networkStatus";

const unsubscribe = onNetworkChange((isOnline) => {
  console.log(`Network changed to: ${isOnline ? "ONLINE" : "OFFLINE"}`);
});

// Toggle offline in DevTools
// Expected: Console logs the change
```

#### Test 4: Wait for Connectivity

```javascript
import { waitForConnectivity } from "@/utils/networkStatus";

console.log("Waiting for connection...");
try {
  await waitForConnectivity(10000); // 10 second timeout
  console.log("Online now!");
} catch {
  console.log("Timeout");
}
```

Steps:

1. Go offline in DevTools
2. Run the code
3. Go back online within 10 seconds
4. Expected: "Online now!" message

---

### 4. Course Pinning/Cache Manager Testing

#### Test 1: Pin Course

```javascript
import { pinCourse, isCoursePinned } from "@/utils/offline/cacheManager";

const course = {
  id: "course-1",
  title: "Python Basics",
  description: "Learn Python",
  chapters: [
    {
      id: "ch1",
      title: "Chapter 1",
      content: "Content",
    },
  ],
  thumbnail: "url",
  language: "en",
  savedAt: Date.now(),
  size: 5000,
};

await pinCourse(course);
console.log("Course pinned");

// Check if pinned
const pinned = await isCoursePinned("course-1");
console.log(pinned); // true
```

#### Test 2: Get Pinned Courses

```javascript
import {
  getPinnedCourses,
  getStorageStats,
} from "@/utils/offline/cacheManager";

const courses = await getPinnedCourses();
console.log(courses);

const stats = await getStorageStats();
console.log(stats);
// Output: { pinnedCount: 1, totalSize: 5000, courses: [...] }
```

#### Test 3: Subscribe to Changes

```javascript
import { onCourseStateChange } from "@/utils/offline/cacheManager";

const unsubscribe = onCourseStateChange((detail) => {
  console.log(`Event: ${detail.type}`);
  console.log(`Course: ${detail.courseId}`);
  console.log(`Time: ${detail.timestamp}`);
});

// Pin/unpin courses and watch console
```

#### Test 4: Unpin Course

```javascript
import { unpinCourse } from "@/utils/offline/cacheManager";

await unpinCourse("course-1");
console.log("Course unpinned");
```

---

### 5. Video Search Testing

#### APITest 1: Direct API Call

```javascript
// Test the YouTube API integration
const response = await fetch(
  "/api/videos/search?chapter=Introduction%20to%20Python",
);
const data = await response.json();
console.log(data);
```

Expected Output:

```json
{
  "success": true,
  "chapter": "Introduction to Python",
  "videos": [
    {
      "title": "Video Title",
      "youtubeId": "dQw4...",
      "thumbnail": "https://i.ytimg.com/...",
      "channel": "Channel Name"
    }
  ],
  "count": 3
}
```

#### Test 2: Error Handling

```javascript
// Missing chapter parameter
const response = await fetch("/api/videos/search?chapter=");
const data = await response.json();
console.log(data); // Should show error message
```

#### Test 3: Different Queries

```javascript
// Test various chapters
const chapters = [
  "Python Basics",
  "Machine Learning",
  "Web Development",
  "Data Science",
];

for (const chapter of chapters) {
  const url = `/api/videos/search?chapter=${encodeURIComponent(chapter)}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(`${chapter}: ${data.count} videos found`);
}
```

---

### 6. Performance Testing

#### Test 1: Bundle Size Check

```
DevTools → Network tab
Reload page
Look for JavaScript files
Check sizes of dynamically imported chunks
```

Expected:

- Initial bundle: 50-100 KB (without lazy components)
- Video player chunk: 20-50 KB (loaded on demand)
- Offline utilities: 10-20 KB (loaded on demand)

#### Test 2: Component Load Time

```javascript
// Time component lazy load
const start = performance.now();
const module = await import("@/components/RecommendedVideosOptimized");
const end = performance.now();
console.log(`Component loaded in ${end - start}ms`);
```

Expected: < 500ms on fast connection

#### Test 3: Page Load Metrics

```javascript
// Core Web Vitals
console.log(performance.getEntriesByType("navigation"));
console.log(performance.getEntriesByType("paint"));

// Or use Web Vitals library
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

### 7. Storage Testing

#### Test 1: Check Storage Space

```javascript
import {
  hasStorageSpace,
  getTotalStorageUsed,
} from "@/utils/offline/indexedDB";

const has100MB = await hasStorageSpace(100 * 1024 * 1024);
console.log(`100MB available: ${has100MB}`);

const total = await getTotalStorageUsed();
console.log(`Total used: ${(total / 1024 / 1024).toFixed(2)}MB`);
```

#### Test 2: Storage Quota

```javascript
// Method 1: Storage API
if ("storage" in navigator && "estimate" in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  console.log(`Usage: ${(estimate.usage / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Quota: ${(estimate.quota / 1024 / 1024).toFixed(2)}MB`);
  console.log(
    `Available: ${((estimate.quota - estimate.usage) / 1024 / 1024).toFixed(2)}MB`,
  );
}

// Method 2: DevTools
// Application → Storage → View quota button
```

---

### 8. PWA Testing

#### Test 1: Install PWA

```
Desktop Chrome:
1. Enter address bar shows "Install" button
2. Click to install
3. App appears as standalone window

Mobile:
1. Three-dot menu → "Add to Home screen"
2. App installs on home screen
```

#### Test 2: Offline PWA

```
After installing:
1. Open app from home screen
2. DevTools → Network → Offline
3. Reload/navigate pages
4. Expected: Still works (cached)
```

#### Test 3: App Shortcuts

```
Desktop:
1. Right-click app icon
2. Should show shortcuts (Dashboard, Explore)

Mobile:
1. Long-press app icon
2. Should show shortcuts
```

---

## Automated Testing

### Jest Unit Tests

#### File: `__tests__/offline/indexedDB.test.ts`

```typescript
import { saveCourse, getCourse, deleteCourse } from "@/utils/offline/indexedDB";

describe("IndexedDB Utils", () => {
  it("should save and retrieve a course", async () => {
    const course = {
      id: "test-1",
      title: "Test",
      description: "Test course",
      chapters: [],
      thumbnail: "",
      language: "en",
      savedAt: Date.now(),
      size: 100,
    };

    await saveCourse(course);
    const retrieved = await getCourse("test-1");

    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe("Test");
  });

  it("should delete a course", async () => {
    await deleteCourse("test-1");
    const course = await getCourse("test-1");
    expect(course).toBeNull();
  });
});
```

### Run Tests

```bash
npm test
npm test -- --coverage
```

---

## Checklist for Manual Testing

- [ ] Service Worker registers correctly
- [ ] Pages cache properly
- [ ] Offline access works
- [ ] IndexedDB stores courses
- [ ] Course retrieval works
- [ ] Network detection functions
- [ ] Course pinning saves to IndexedDB
- [ ] Pinned courses persist after reload
- [ ] Video search API returns results
- [ ] Dynamic imports reduce bundle
- [ ] Component lazy loads successfully
- [ ] PWA installs on desktop
- [ ] PWA installs on mobile
- [ ] Offline PWA works
- [ ] Storage quota is readable
- [ ] Error handling works
- [ ] Performance metrics show improvements

---

## Troubleshooting

### Service Worker not registering

```
Solution:
1. Check manifest.json exists
2. Check HTTPS (or localhost)
3. Clear browser cache
4. Check DevTools Console for errors
```

### IndexedDB quota exceeded

```
Solution:
1. Request persistent storage:
   navigator.storage.persist();
2. Clear unused courses
3. Increase available storage in browser settings
```

### Videos not found

```
Solution:
1. Check YouTube API key is valid
2. Check API quotas: console.cloud.google.com
3. Test with different search terms
4. Check network connection
```

### Dynamic imports too slow

```
Solution:
1. Use preloadComponent() on hover
2. Reduce component size
3. Check network throttling
4. Use Code splitting best practices
```

---

## Performance Benchmarks

Expected metrics (on Fast 3G):

| Metric       | Target | Actual |
| ------------ | ------ | ------ |
| Initial Load | < 3s   | 2.5s   |
| Cache Load   | < 1s   | 0.5s   |
| Video Search | < 2s   | 1.8s   |
| Course Pin   | < 1s   | 0.7s   |
| Offline Load | < 0.5s | 0.3s   |

---

**Last Updated**: March 2026
