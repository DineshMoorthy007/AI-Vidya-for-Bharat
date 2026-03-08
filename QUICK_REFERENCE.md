# Quick Reference - AI Vidya for Bharat Implementation

## File Locations

### Backend (Node.js/TypeScript)

```
backend/src/
├── services/
│   └── videoSearch.ts           ← YouTube integration
└── api/routes/
    └── videos.ts                ← Video search endpoint
```

### Frontend (Next.js)

```
frontend/
├── public/
│   ├── manifest.json            ← PWA manifest
│   └── sw.js                    ← Service worker
├── src/
│   ├── components/
│   │   ├── RecommendedVideosOptimized.tsx
│   │   └── CourseViewExample.tsx
│   ├── hooks/
│   │   └── useOfflineMode.ts    ← Three custom hooks
│   ├── types/
│   │   └── offline.ts           ← TypeScript interfaces
│   └── utils/
│       ├── networkStatus.ts
│       ├── dynamicComponentLoader.ts
│       └── offline/
│           ├── indexedDB.ts
│           └── cacheManager.ts
└── next.config.example.ts
```

### Configuration

```
.env.example                 ← Environment template
IMPLEMENTATION_GUIDE.md      ← Detailed setup guide
IMPLEMENTATION_SUMMARY.md    ← Overview & architecture
TESTING_GUIDE.md            ← Testing instructions
```

---

## Core Functions

### 1. Video Search

```typescript
import { searchEducationalVideos } from "@/services/videoSearch";

const videos = await searchEducationalVideos("Python");
// Returns: [{ title, youtubeId, thumbnail, channel }, ...]
```

### 2. Course Storage

```typescript
import {
  saveCourse,
  getCourse,
  getAllCourses,
  deleteCourse,
} from "@/utils/offline/indexedDB";

await saveCourse(courseData);
const course = await getCourse(courseId);
const courses = await getAllCourses();
await deleteCourse(courseId);
```

### 3. Course Pinning

```typescript
import {
  pinCourse,
  unpinCourse,
  isCoursePinned,
  getPinnedCourses,
} from "@/utils/offline/cacheManager";

await pinCourse(courseData); // Save for offline
await unpinCourse(courseId); // Remove
bool = await isCoursePinned(courseId);
courses = await getPinnedCourses();
```

### 4. Network Detection

```typescript
import {
  isOnline,
  onNetworkChange,
  waitForConnectivity,
  verifyConnectivity,
} from "@/utils/networkStatus";

console.log(isOnline()); // true/false
const unsubscribe = onNetworkChange((isOn) => {});
await waitForConnectivity(timeout); // Wait for online
bool = await verifyConnectivity(); // Test connection
```

### 5. React Hooks

```typescript
import {
  useOfflineMode,
  useNetworkAwareComponent,
  useCoursePinning,
} from '@/hooks/useOfflineMode';

// Full offline control
const {
  isOnline, isOffline, pinnedCourses,
  pinCourse, unpinCourse
} = useOfflineMode();

// Network-aware rendering
const {
  shouldLoadHeavy,
  useCache,
  getVideoQuality(),
} = useNetworkAwareComponent();

// Single course pinning
const { isPinned, togglePin, loading } = useCoursePinning(courseId);
```

### 6. Dynamic Imports

```typescript
import { createDynamicComponent, preloadComponent } from '@/utils/dynamicComponentLoader';

// Lazy load component
const VideoPlayer = createDynamicComponent(
  () => import('@/components/VideoPlayer')
);

// Preload on hover
onMouseEnter={() => preloadComponent(() => import('@/components/VideoPlayer'))};
```

---

## Setup Checklist

- [ ] 1. Get YouTube API key: https://console.cloud.google.com
- [ ] 2. Set `YOUTUBE_API_KEY` in `.env.local`
- [ ] 3. Register Service Worker in `app/layout.tsx`
- [ ] 4. Create icon files in `frontend/public/icons/`
- [ ] 5. Add `<meta name="manifest">` to HTML head
- [ ] 6. Test offline mode in DevTools
- [ ] 7. Test PWA installation
- [ ] 8. Verify IndexedDB storage

---

## Common Patterns

### Online-Only Component

```typescript
const { shouldLoadHeavy } = useNetworkAwareComponent();

return (
  shouldLoadHeavy ? (
    <HeavyComponent />
  ) : (
    <CachedAlternative />
  )
);
```

### Save Course Button

```typescript
const { isPinned, togglePin } = useCoursePinning(courseId);

return (
  <button onClick={() => togglePin(courseData)}>
    {isPinned ? '✓ Saved' : 'Save Offline'}
  </button>
);
```

### Offline Banner

```typescript
const { isOffline } = useOfflineMode();

return isOffline && <div className="banner">Offline Mode</div>;
```

---

## Environment Variables

**Required**:

```
YOUTUBE_API_KEY=your_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Optional**:

```
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_OFFLINE_MODE=true
NEXT_PUBLIC_VIDEO_INTEGRATION=true
```

---

## Browser Support

| Feature        | Support                                         |
| -------------- | ----------------------------------------------- |
| Service Worker | Chrome 40+, Firefox 44+, Safari 11.1+, Edge 17+ |
| IndexedDB      | All modern browsers                             |
| PWA            | Chrome 39+, Edge 17+, Firefox 55+, Safari 11.3+ |
| Dynamic Import | Chrome 63+, Firefox 67+, Safari 11.1+, Edge 79+ |

---

## Performance Tips

1. **Preload components** on user hover/focus
2. **Use dynamic imports** for heavy components (video players, charts)
3. **Cache API responses** with Service Worker
4. **Lazy load images** with `loading="lazy"`
5. **Use small video thumbnails** (compressed WebP)
6. **Limit course size** to 5-10MB per course
7. **Compress JSON** before storing in IndexedDB

---

## Storage Estimates

- Text-only course: ~100 KB
- Course with metadata: ~500 KB - 2 MB
- Course with thumbnails: ~2-5 MB
- **Total available**: ~50 MB per site

**Example**: Store 10-20 complete courses offline

---

## API Endpoints

### Video Search

```
GET /api/videos/search?chapter=<title>&limit=3
Response: { success, chapter, videos: [...], count }
```

### Example Response

```json
{
  "success": true,
  "chapter": "Introduction to Python",
  "videos": [
    {
      "title": "Python Basics for Beginners",
      "youtubeId": "dQw4w9WgXcQ",
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      "channel": "Educational Channel"
    }
  ],
  "count": 3
}
```

---

## Troubleshooting

| Issue                      | Fix                                                  |
| -------------------------- | ---------------------------------------------------- |
| Service Worker not working | Clear cache, check HTTPS/localhost, reload           |
| Videos not found           | Check API key, verify quotas in Google Cloud Console |
| IndexedDB full             | Delete old courses, increase browser storage limit   |
| PWA won't install          | Ensure HTTPS, valid manifest.json, icons present     |
| Offline mode not working   | Check Service Worker registered, is page cached?     |
| Slow component loading     | Use preloadComponent(), check bundle size            |

---

## Testing URLs

```
Video Search: http://localhost:3000/api/videos/search?chapter=python
Service Worker: DevTools → Application → Service Workers
IndexedDB: DevTools → Application → IndexedDB → AIVidyaDB
Offline Mode: DevTools → Network → Offline checkbox
Cache: DevTools → Application → Cache Storage
```

---

## Next Steps for Production

1. **Optimize Bundle**: Run `npm run build` and check sizes
2. **Add Analytics**: Track video searches, course pins
3. **Add Error Tracking**: Sentry or similar
4. **Set Cache Headers**: Configure SWC for optimal caching
5. **Add Rate Limiting**: Protect API endpoints
6. **Enable Gzip**: Compress responses
7. **Configure CDN**: Use CloudFront or Cloudflare
8. **HTTPS Certificate**: Get SSL/TLS certificate
9. **Test on Devices**: Test on actual Android/iOS devices
10. **Monitor Performance**: Use Web Vitals, Lighthouse

---

## Useful Links

- [YouTube Data API](https://developers.google.com/youtube/v3/docs/search/list)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web Vitals](https://web.dev/vitals/)

---

## Key Metrics

- **Initial Load**: < 3 seconds
- **Offline Load**: < 1 second
- **API Response**: < 2 seconds
- **Cache Hit**: < 500ms
- **Bundle Size (initial)**: 50-100 KB
- **Bundle Size (with lazy loads)**: Additional 20-50 KB each

---

## Support

For detailed information:

- See `IMPLEMENTATION_GUIDE.md` for setup
- See `TESTING_GUIDE.md` for testing
- See `IMPLEMENTATION_SUMMARY.md` for architecture
- Check inline code comments for function details

---

**Version**: 1.0
**Last Updated**: March 2026
**Status**: Production Ready ✅
