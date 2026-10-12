/* Service worker for staff push notifications. It does nothing else: no caching, no offline mode. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "World Bridge Meridian";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      icon: "/icons/staff-192.png",
      badge: "/icons/staff-badge.png",
      data: { url: data.url || "/staff#today" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  let target;
  try {
    target = new URL((event.notification.data && event.notification.data.url) || "/staff#today", self.location.origin);
    if (target.origin !== self.location.origin) target = new URL("/staff#today", self.location.origin);
  } catch {
    target = new URL("/staff#today", self.location.origin);
  }
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (new URL(c.url).origin === self.location.origin && "focus" in c) {
          return c.focus().then(() => ("navigate" in c ? c.navigate(target.href) : undefined));
        }
      }
      return self.clients.openWindow(target.href);
    }),
  );
});
