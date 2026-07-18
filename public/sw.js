/* ============================================================
 * AU Track Service Worker
 * Offline caching, background sync, and push notifications
 * ============================================================ */

const CACHE_VERSION = "v1";
const CACHE_NAME = `au-track-${CACHE_VERSION}`;
const RUNTIME_CACHE = `au-track-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `au-track-images-${CACHE_VERSION}`;

// URLs to precache (app shell + key routes)
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/login",
  "/calculator",
  "/manifest.webmanifest",
  "/icon-192.svg",
  "/icon-512.svg",
  "/icon-maskable.svg",
];

// Maximum entries and max age for image cache
const IMAGE_CACHE_MAX_ENTRIES = 50;
const IMAGE_CACHE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/* ----------------------------------------------------------
 * Install: precache app shell
 * ---------------------------------------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache URLs individually so one failure doesn't reject all
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: "reload" })
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((err) => {
                console.warn(`[SW] Precache failed for ${url}:`, err.message);
              })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* ----------------------------------------------------------
 * Activate: clean old caches and claim clients
 * ---------------------------------------------------------- */
self.addEventListener("activate", (event) => {
  const validCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !validCaches.includes(name))
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

/* ----------------------------------------------------------
 * Helper: limit cache size and expire old entries
 * ---------------------------------------------------------- */
async function trimImageCache() {
  const cache = await caches.open(IMAGE_CACHE);
  const keys = await cache.keys();

  // Sort by insertion order (URLs array preserves order roughly)
  if (keys.length > IMAGE_CACHE_MAX_ENTRIES) {
    const toRemove = keys.slice(0, keys.length - IMAGE_CACHE_MAX_ENTRIES);
    await Promise.all(toRemove.map((key) => cache.delete(key)));
  }

  // Expire old entries
  const now = Date.now();
  for (const request of keys) {
    const response = await cache.match(request);
    if (!response) continue;
    const dateHeader = response.headers.get("date");
    if (dateHeader) {
      const responseTime = new Date(dateHeader).getTime();
      if (now - responseTime > IMAGE_CACHE_MAX_AGE_SECONDS * 1000) {
        await cache.delete(request);
      }
    }
  }
}

/* ----------------------------------------------------------
 * Helper: is this a Supabase API request?
 * ---------------------------------------------------------- */
function isSupabaseRequest(url) {
  const supabasePatterns = [
    /supabase\.co/,
    /\.supabase\./,
    /supabase\.in/,
  ];
  return supabasePatterns.some((pattern) => pattern.test(url.href));
}

/* ----------------------------------------------------------
 * Helper: is this an API route?
 * ---------------------------------------------------------- */
function isApiRoute(url) {
  return url.pathname.startsWith("/api/");
}

/* ----------------------------------------------------------
 * Helper: is this an image request?
 * ---------------------------------------------------------- */
function isImageRequest(request) {
  return (
    request.destination === "image" ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif)$/i.test(request.url)
  );
}

/* ----------------------------------------------------------
 * Helper: is this a static asset?
 * ---------------------------------------------------------- */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/static/") ||
    /\.(?:js|css|woff2?|ttf|eot)$/i.test(url.pathname)
  );
}

/* ----------------------------------------------------------
 * Fetch strategies
 * ---------------------------------------------------------- */

// Cache-first: try cache, fallback to network
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Update cache in background (stale-while-revalidate)
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network-first: try network, fallback to cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Return a basic offline response for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await cache.match("/");
      if (offlinePage) return offlinePage;
    }
    throw error;
  }
}

// Network-only: always fetch from network, no caching
async function networkOnly(request) {
  return fetch(request);
}

/* ----------------------------------------------------------
 * Main fetch handler
 * ---------------------------------------------------------- */
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") {
    // For non-GET requests, try network; if offline, store for background sync
    if (!navigator.onLine && isApiRoute(new URL(request.url))) {
      event.respondWith(
        new Response(
          JSON.stringify({
            error: "You are offline. Your action will be synced when you reconnect.",
            offline: true,
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }
    return;
  }

  const url = new URL(request.url);

  // Skip cross-origin requests except for same-origin
  if (url.origin !== self.location.origin) {
    // Allow Supabase and image CDN requests to pass through with their strategy
    if (isSupabaseRequest(url)) {
      event.respondWith(networkOnly(request));
      return;
    }
    // For other cross-origin (e.g., Google Fonts, images), use network-first
    if (isImageRequest(request)) {
      event.respondWith(cacheFirst(request, IMAGE_CACHE).catch(() => fetch(request)));
      return;
    }
    return; // Let the browser handle other cross-origin requests
  }

  // --- Same-origin routing ---

  // Supabase API: network-only
  if (isSupabaseRequest(url)) {
    event.respondWith(networkOnly(request));
    return;
  }

  // API routes: network-first with cache fallback
  if (isApiRoute(url)) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Images: cache-first with expiration
  if (isImageRequest(request)) {
    event.respondWith(
      cacheFirst(request, IMAGE_CACHE)
        .then((response) => {
          trimImageCache(); // Clean up in background
          return response;
        })
        .catch(() => {
          // Return a transparent 1x1 placeholder if image fails
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
            { headers: { "Content-Type": "image/svg+xml" } }
          );
        })
    );
    return;
  }

  // Static assets: cache-first (immutable, long-lived)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Navigation requests (pages): network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Default: try cache, then network
  event.respondWith(cacheFirst(request, RUNTIME_CACHE));
});

/* ----------------------------------------------------------
 * Background Sync: retry failed saves when back online
 * ---------------------------------------------------------- */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-grades") {
    event.waitUntil(syncPendingGrades());
  } else if (event.tag === "sync-general") {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingGrades() {
  try {
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of allClients) {
      client.postMessage({ type: "SYNC_GRADES", source: "background-sync" });
    }
  } catch (err) {
    console.error("[SW] Background sync failed:", err);
    throw err;
  }
}

async function syncPendingActions() {
  try {
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of allClients) {
      client.postMessage({ type: "SYNC_ACTIONS", source: "background-sync" });
    }
  } catch (err) {
    console.error("[SW] General sync failed:", err);
    throw err;
  }
}

/* ----------------------------------------------------------
 * Push Notifications
 * ---------------------------------------------------------- */
self.addEventListener("push", (event) => {
  let payload = {
    title: "AU Track Notification",
    body: "You have a new update",
    icon: "/icon-192.svg",
    badge: "/icon-192.svg",
    data: { url: "/" },
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/icon-192.svg",
    badge: payload.badge || "/icon-192.svg",
    vibrate: [100, 50, 100],
    data: payload.data || { url: "/" },
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
    tag: payload.tag || "au-track-notification",
    renotify: !!payload.renotify,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

/* ----------------------------------------------------------
 * Notification click handler
 * ---------------------------------------------------------- */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if found
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

/* ----------------------------------------------------------
 * Message handler: for skipWaiting from page
 * ---------------------------------------------------------- */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
