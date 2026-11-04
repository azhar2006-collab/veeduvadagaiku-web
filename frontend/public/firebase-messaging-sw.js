/* Firebase web configuration is public client configuration, not a server secret. */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDSsxg-z2fIhYVX5YqrqELlGt7RS8Xdxwg',
  authDomain: 'veeduvadagaiku-66d6a.firebaseapp.com',
  projectId: 'veeduvadagaiku-66d6a',
  storageBucket: 'veeduvadagaiku-66d6a.firebasestorage.app',
  messagingSenderId: '444607450174',
  appId: '1:444607450174:web:320f8f5efc54ee4a38d56f',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || 'Property view';
  const options = {
    body: payload.data?.body || 'Someone viewed one of your properties.',
    data: { url: payload.data?.url || '/owner/dashboard' },
    icon: '/favicon.ico',
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/owner/dashboard', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin));
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
