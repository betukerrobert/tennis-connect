// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA5989WW4QwPQ_UFRMNkcq93ytTHm_LS8A",
  authDomain: "tennis-connect-bf477.firebaseapp.com",
  projectId: "tennis-connect-bf477",
  storageBucket: "tennis-connect-bf477.firebasestorage.app",
  messagingSenderId: "408365904375",
  appId: "1:408365904375:web:2619e161ba05f6321fbef2",
  measurementId: "G-NK8ZV2KETE"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Tennis Connect';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  // Navigate to appropriate page based on notification type
  if (data?.type === 'match_invite' || data?.type === 'match_reschedule') {
    url = '/matches';
  } else if (data?.type === 'connection_request') {
    url = '/discovery';
  } else if (data?.type === 'new_message') {
    url = '/messages';
  }

  event.waitUntil(
    clients.openWindow(url)
  );
});
