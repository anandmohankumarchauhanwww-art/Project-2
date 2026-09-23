import { precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

/*
 * PUSH NOTIFICATION
 */
self.addEventListener("push", (event) => {
  console.log("SHIS PUSH EVENT RECEIVED");

  let data = {
    title: "SHIS Check-in",
    body: "Your SHIS check-in is ready.",
    url: "/checkin",
  };

  if (event.data) {
    try {
      const incomingData = event.data.json();

      data = {
        ...data,
        ...incomingData,
      };
    } catch (error) {
      console.error(
        "SHIS could not parse push data:",
        error
      );
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: "shis-checkin",
    renotify: true,
    data: {
      url: data.url || "/checkin",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      notificationOptions
    )
  );
});

/*
 * NOTIFICATION CLICK
 */
self.addEventListener(
  "notificationclick",
  (event) => {
    console.log(
      "SHIS NOTIFICATION CLICKED"
    );

    event.notification.close();

    const targetUrl =
      event.notification.data?.url ||
      "/checkin";

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            if ("focus" in client) {
              client.navigate(targetUrl);
              return client.focus();
            }
          }

          if (self.clients.openWindow) {
            return self.clients.openWindow(
              targetUrl
            );
          }

          return undefined;
        })
    );
  }
);