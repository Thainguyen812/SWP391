/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

const isUsableConfig = (config) =>
  config &&
  config.apiKey &&
  config.projectId &&
  config.messagingSenderId &&
  config.appId;

fetch('/firebase-config.json', { cache: 'no-store' })
  .then((response) => (response.ok ? response.json() : {}))
  .then((config) => {
    const firebaseConfig = config.firebase || config;
    if (!isUsableConfig(firebaseConfig)) {
      console.warn('[FCM_SW] Missing Firebase web config. Background push is disabled.');
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'UrbanPark';
      const options = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        data: payload.data || {}
      };

      self.registration.showNotification(title, options);
    });
  })
  .catch((error) => {
    console.warn('[FCM_SW] Firebase background messaging initialization failed.', error);
  });

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/driver');
      return undefined;
    })
  );
});
