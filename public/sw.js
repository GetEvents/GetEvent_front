const CACHE_NAME = "getevent-pwa-v1";
const STATIC_ASSETS = ["/", "/manifest.webmanifest", "/flashicon.png"];

// 1. Installation : mise en cache immédiate des assets de démarrage
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

// 2. Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// 3. Gestion des requêtes réseau (Fetch)
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignorer les requêtes non-GET et les appels API / Socket
  if (
    request.method !== "GET" ||
    request.url.includes("/api/") ||
    request.url.includes("/socket.io/") ||
    request.url.startsWith("chrome-extension")
  ) {
    return;
  }

  const url = new URL(request.url);

  // A. Assets statiques (JS, CSS, images, polices) : Cache-First avec rafraîchissement en tâche de fond (Stale-While-Revalidate)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|css|js)$/);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      }),
    );
    return;
  }

  // B. Pages HTML / Navigations : Network-First avec fallback cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  // C. Autres requêtes : réseau direct avec fallback cache
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// 4. Écoute des notifications Push
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "GetEvent", message: event.data ? event.data.text() : "" };
  }

  const title = data.title || "GetEvent";
  const message = data.message || "Nouvelle notification";
  const url = data.url || "/";
  const unreadCount = data.unreadCount;

  if ("setAppBadge" in self.navigator) {
    if (typeof unreadCount === "number" && unreadCount > 0) {
      self.navigator.setAppBadge(unreadCount).catch(() => {});
    } else if (unreadCount === 0) {
      self.navigator.clearAppBadge().catch(() => {});
    } else {
      self.navigator.setAppBadge().catch(() => {});
    }
  }

  const options = {
    body: message,
    icon: "/flashicon.png",
    badge: "/flashicon.png",
    vibrate: [100, 50, 100],
    data: {
      url: url,
      unreadCount: unreadCount,
    },
    actions: [
      {
        action: "open",
        title: "Ouvrir",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Clic sur la notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || "/";
  const fullUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(fullUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(fullUrl);
        }
      }),
  );
});
