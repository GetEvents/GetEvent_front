self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Écoute de l'événement push déclenché par le backend
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

  // 1. Mise à jour du badge sur l'icône de l'application (Badging API)
  if ("setAppBadge" in self.navigator) {
    if (typeof unreadCount === "number" && unreadCount > 0) {
      self.navigator.setAppBadge(unreadCount).catch(() => {});
    } else if (unreadCount === 0) {
      self.navigator.clearAppBadge().catch(() => {});
    } else {
      self.navigator.setAppBadge().catch(() => {});
    }
  }

  // 2. Affichage de la notification native du système
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

// Clic sur la notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si un onglet de l'app est déjà ouvert, lui donner le focus et naviguer
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
