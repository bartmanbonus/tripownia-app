const CACHE_NAME = "tripownia-v6";
const APP_SHELL = [
  "/offline.html",
  "/tripownia-app-icon-v2.png?v=20260913",
];

const PRIVATE_NAV_PREFIXES = [
  "/app",
  "/konto",
  "/profil",
  "/moje-podroze",
  "/moja-podroz",
  "/dodaj-podroz",
  "/ulubione",
  "/alerty",
  "/dla-ciebie",
  "/porownaj",
  "/admin",
];

function isPrivateNavigation(url) {
  return PRIVATE_NAV_PREFIXES.some((prefix) =>
    url.pathname === prefix || url.pathname.startsWith(prefix + "/")
  );
}

function canStoreResponse(request, response, url, isNavigation, isStaticAsset) {
  if (!response.ok) return false;

  const cacheControl = (response.headers.get("cache-control") || "").toLowerCase();
  if (cacheControl.includes("no-store") || cacheControl.includes("private")) return false;

  if (isStaticAsset) return true;
  if (!isNavigation) return false;

  // Dynamic/private screens and query-driven pages should always come from the
  // network so users do not see stale account/planner/offer state after deploys.
  if (isPrivateNavigation(url) || url.search) return false;

  return true;
}

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

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/go/")) {
    return;
  }

  const isNavigation = request.mode === "navigate";
  const isStaticAsset = /\.(?:css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname);
  if (!isNavigation && !isStaticAsset) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (canStoreResponse(request, response, url, isNavigation, isStaticAsset)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Keep a lightweight offline fallback without serving cached private state.
        if (isNavigation) return caches.match("/offline.html");
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
    icon: "/tripownia-app-icon-v2.png?v=20260913",
    badge: "/tripownia-app-icon-v2.png?v=20260913",
    data: { url: data.url || "/app" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/app";
  event.waitUntil(clients.openWindow(url));
});
