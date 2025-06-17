// Import and configure the Firebase SDK
// This is a minimal service worker for Firebase Cloud Messaging.
// You'll need to include the Firebase SDK scripts.

// Scripts for Firebase v9 CJS SDK (common js)
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with the same config
const firebaseConfig = {
  apiKey: "AIzaSyBHcMtDRyGM2_t67li_QMjLXcSKlFxCQps", // Replace with your actual API key
  authDomain: "control-shift-pro-39b9c.firebaseapp.com",
  databaseURL: "https://control-shift-pro-39b9c-default-rtdb.firebaseio.com",
  projectId: "control-shift-pro-39b9c",
  storageBucket: "control-shift-pro-39b9c.firebasestorage.app",
  messagingSenderId: "441289632703",
  appId: "1:441289632703:web:f81e27861c64bb7baf4f0a",
  measurementId: "G-XRGQLVJYME"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: payload.notification?.icon || '/assets/icons/icon-192x192.png', // Default icon
    image: payload.data?.imageUrl, // Optional image from data payload
    badge: '/assets/icons/badge.png', // Optional badge
    // click_action: payload.fcmOptions?.link || payload.data?.click_action || '/', // Where to go on click
    data: payload.data // Pass along data for when user clicks notification
  };

  // Ensure the client is focused if it's already open
  // This part is a bit more complex and involves checking clients
  // For simplicity, we'll just show the notification.
  // A more advanced handler would check if the app is already open and in the foreground.

  self.registration.showNotification(notificationTitle, notificationOptions)
    .catch(err => console.error("Error displaying background notification", err));
});

// Optional: Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);
  
  event.notification.close();

  const clickAction = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window hosting the app is already open, focus it.
      for (const client of clientList) {
        // You might need to refine this URL check if your app can be hosted at multiple paths.
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one.
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
