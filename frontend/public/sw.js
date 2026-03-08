/**
 * Service Worker for AI Vidya for Bharat
 * Handles offline mode, caching strategies, and background sync
 * Supports offline access to core pages and course data
 */

const CACHE_NAME = "ai-vidya-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/explore",
  "/chat",
  "/settings",
  "/api/courses",
];

/**
 * Install event: Cache core pages and assets
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching core pages");
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting(); // Activate immediately
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim(); // Claim all clients immediately
});

/**
 * Fetch event: Network-first strategy with cache fallback
 * For API calls and dynamic content, try network first
 * For static assets, use cache-first strategy
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache POST, PUT, DELETE requests
  if (request.method !== "GET") {
    return;
  }

  // Skip non-HTTP(S) requests (e.g., chrome-extension://)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Strategy 1: Network-first for API calls
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page if available
            return caches.match("/offline");
          });
        }),
    );
    return;
  }

  // Strategy 2: Cache-first for static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        });
      }),
    );
    return;
  }

  // Strategy 3: Stale-while-revalidate for HTML pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      });

      return cachedResponse || fetchPromise;
    }),
  );
});

/**
 * Handle messages from clients
 * Supports commands like clearing cache or checking status
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.type === "GET_CACHE_STATUS") {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((requests) => {
        event.ports[0].postMessage({
          cachedUrls: requests.map((r) => r.url),
          count: requests.length,
        });
      });
    });
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/**
 * Periodic background sync (Requires user permission)
 * Syncs offline changes back to server when connection is restored
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-data") {
    event.waitUntil(
      // This would typically fetch IndexedDB data and sync to server
      Promise.resolve(),
    );
  }
});

console.log("[Service Worker] Loaded and ready");
