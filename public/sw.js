const CACHE_NAME = "tripownia-v2";
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
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
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
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/app")))
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
