// Service Worker برای بهینه‌سازی موبایل و مدیریت کش

// 🔄 VERSION CONTROL - Semantic Versioning
const APP_VERSION = "v1.0.1"; // Will be auto-updated by build script
const CACHE_NAME = `pardis-academy-${APP_VERSION}`;
const STATIC_CACHE = `static-${APP_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${APP_VERSION}`;

// Cache version برای تشخیص تغییرات
const CACHE_VERSION_KEY = "cache-version";
const CURRENT_VERSION = APP_VERSION;

// منابعی که باید کش شوند
const STATIC_ASSETS = [
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/font-loader.js",
  "/vite.svg",
  // CSS و JS اصلی (Vite آن‌ها را تولید می‌کند)
];

// API endpoints که باید کش شوند
const CACHEABLE_APIS = [
  "/api/home/categories",
  "/api/courses",
  "/api/home/courses",
];

// نصب Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error("Failed to cache static assets:", error);
      })
  );

  // فعال‌سازی فوری Service Worker
  self.skipWaiting();
});

// فعال‌سازی Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...", APP_VERSION);

  event.waitUntil(
    Promise.all([
      // 1. حذف تمام کش‌های قدیمی
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // حذف کش‌های قدیمی که با version فعلی مطابقت ندارند
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            ) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // 2. پاک کردن localStorage برای cache busting
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "CACHE_UPDATED",
            version: APP_VERSION,
            action: "CLEAR_STORAGE",
          });
        });
      }),
    ])
  );

  // کنترل فوری همه کلاینت‌ها
  self.clients.claim();
});

// رهگیری درخواست‌ها
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // فقط درخواست‌های HTTP/HTTPS را پردازش کن
  if (!request.url.startsWith("http")) {
    return;
  }

  // درخواست‌های POST, PUT, DELETE را مستقیماً به شبکه بفرست
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // استراتژی Cache First برای منابع استاتیک
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // استراتژی Network First برای API ها
  if (isApiRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // استراتژی Stale While Revalidate برای تصاویر
  if (isImageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // پیش‌فرض: Network First
  event.respondWith(networkFirst(request));
});

// تشخیص نوع درخواست
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.match(/\.(css|js|woff2?|ttf|eot|otf)$/) ||
    url.hostname === "cdn.jsdelivr.net"
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith("/api/") ||
    CACHEABLE_APIS.some((api) => url.pathname.startsWith(api))
  );
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/);
}

// استراتژی Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok && networkResponse.status < 400) {
      const cache = await caches.open(STATIC_CACHE);
      // Clone response before caching
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache first failed:", error);
    // Try to return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// استراتژی Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // فقط درخواست‌های موفق GET را کش کن
    if (
      networkResponse &&
      networkResponse.ok &&
      networkResponse.status < 400 &&
      request.method === "GET"
    ) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Clone response before caching
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);

    // فقط برای درخواست‌های GET از کش استفاده کن
    if (request.method === "GET") {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // اگر صفحه HTML است، صفحه آفلاین نمایش بده
    if (request.destination === "document") {
      const offlineResponse = await caches.match("/offline.html");
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return new Response("Service Unavailable", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// استراتژی Stale While Revalidate
async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // درخواست شبکه در پس‌زمینه
    const networkResponsePromise = fetch(request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.ok &&
          networkResponse.status < 400
        ) {
          // Clone response before caching
          const responseToCache = networkResponse.clone();
          cache.put(request, responseToCache);
        }
        return networkResponse;
      })
      .catch((error) => {
        console.log("Background fetch failed:", error);
        return null;
      });

    // اگر کش موجود است، آن را برگردان
    if (cachedResponse) {
      // Update cache in background
      networkResponsePromise;
      return cachedResponse;
    }

    // در غیر این صورت منتظر پاسخ شبکه باش
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }

    return new Response("Not Found", {
      status: 404,
      statusText: "Not Found",
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Stale while revalidate failed:", error);
    return new Response("Service Unavailable", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// پیام‌رسانی با کلاینت
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: APP_VERSION });
  }

  // پاک کردن کش به درخواست کلاینت
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log("🧹 Clearing cache:", cacheName);
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
    );
  }
});

// مدیریت push notifications (برای آینده)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
      },
      actions: [
        {
          action: "explore",
          title: "مشاهده",
          icon: "/icon-explore.png",
        },
        {
          action: "close",
          title: "بستن",
          icon: "/icon-close.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// کلیک روی notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

console.log("Service Worker loaded successfully");
