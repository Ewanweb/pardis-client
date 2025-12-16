// Service Worker برای بهینه‌سازی موبایل

const CACHE_NAME = "pardis-academy-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// منابعی که باید کش شوند
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
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
  console.log("Service Worker activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // حذف کش‌های قدیمی
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
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
  return url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/);
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
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache first failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

// استراتژی Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // کش کردن پاسخ موفق
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // اگر صفحه HTML است، صفحه آفلاین نمایش بده
    if (request.destination === "document") {
      return caches.match("/offline.html");
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// استراتژی Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // درخواست شبکه در پس‌زمینه
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // در صورت خطای شبکه، هیچ کاری نکن
    });

  // اگر کش موجود است، آن را برگردان
  if (cachedResponse) {
    return cachedResponse;
  }

  // در غیر این صورت منتظر پاسخ شبکه باش
  return networkResponsePromise;
}

// پیام‌رسانی با کلاینت
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
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
