const CACHE_NAME = "tripownia-v3";
const APP_SHELL = [
  "/app",
  "/dla-ciebie",
  "/moja-podroz",
  "/gdzie-leciec",
  "/porownaj",
  "/ulubione",
  "/alerty",
  "/profil",
  "/tripownia-app-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn("Tripownia SW cache skipped", url, error);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  const isNavigation = request.mode === "navigate";
  const isStaticAsset = /\.(?:css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname);
  if (!isNavigation && !isStaticAsset) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (isNavigation || isStaticAsset)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isNavigation) return caches.match("/app");
        return Response.error();
      })
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data?.json?.() || {}; } catch {}
  const title = data.title || "Tripownia";
  const options = {
    body: data.body || "Pojawiła się nowa informacja o Twojej podróży.",
    icon: "/tripownia-app-icon.svg",
    badge: "/tripownia-app-icon.svg",
    data: { url: data.url || "/app" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/app";
  event.waitUntil(clients.openWindow(url));
});
