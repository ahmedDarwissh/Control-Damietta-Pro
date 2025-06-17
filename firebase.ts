
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';
import 'firebase/compat/messaging'; // Import messaging

// Your web app's Firebase configuration
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

let app: firebase.app.App;
let firestoreDb: firebase.firestore.Firestore;
let storageService: firebase.storage.Storage;
let analyticsService: firebase.analytics.Analytics;
let messagingService: firebase.messaging.Messaging | null = null;

export const initializeFirebaseApp = (): firebase.app.App => {
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized for project:", firebaseConfig.projectId);
    
    try {
      firestoreDb = firebase.firestore(app);
    } catch (e) {
      console.error("Error initializing Firestore or managing persistence", e);
    }
    
    try {
      storageService = firebase.storage(app);
      console.log("Firebase Storage initialized");
    } catch (e) {
      console.error("Error initializing Firebase Storage", e);
    }

    try {
      analyticsService = firebase.analytics(app);
      console.log("Firebase Analytics initialized");
    } catch (e) {
      console.error("Error initializing Firebase Analytics", e);
    }
    
    try {
      if (firebase.messaging.isSupported()) {
        messagingService = firebase.messaging(app);
        console.log("Firebase Messaging initialized.");
      } else {
        console.warn("Firebase Messaging is not supported in this browser.");
      }
    } catch (e) {
      console.error("Error initializing Firebase Messaging", e);
    }

  } else {
    app = firebase.app();
    if (!firestoreDb) firestoreDb = firebase.firestore(app);
    if (!storageService) storageService = firebase.storage(app);
    if (!analyticsService) analyticsService = firebase.analytics(app);
    if (!messagingService && firebase.messaging.isSupported()) {
        try {
            messagingService = firebase.messaging(app);
        } catch (e) {
            console.error("Error re-initializing Firebase Messaging on existing app", e);
        }
    }
  }
  return app;
};

// Ensure app is initialized before exporting services
initializeFirebaseApp();

export const auth = firebase.auth();
export const db = firestoreDb; 
export const storage = storageService;
export const analytics = analyticsService; 
export const messaging = messagingService;


export const requestNotificationPermission = async () => {
  if (!messagingService) {
    console.warn("Messaging not available for permission request.");
    return null;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const token = await messagingService.getToken();
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while getting notification permission: ', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (messagingService) {
      messagingService.onMessage((payload) => {
        console.log('Foreground message received. ', payload);
        resolve(payload);
      });
    } else {
      reject(new Error("Messaging service not initialized."));
    }
  });

let serviceWorkerRegistered = false; 

const performSwRegistration = () => {
  if (serviceWorkerRegistered) {
    // This second check handles cases where performSwRegistration might be called directly
    // after already being queued by registerServiceWorker.
    // console.log("Service worker registration attempt already made or in progress.");
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker API not available in this browser.');
    return;
  }

  if (!messagingService) {
    console.warn('Firebase Messaging service not initialized, cannot register service worker for messaging.');
    return;
  }
  
  serviceWorkerRegistered = true; // Set flag early to prevent multiple attempts from re-entrant calls

  const swUrl = new URL('/firebase-messaging-sw.js', window.location.origin);

  // Wait for the service worker system to be ready
  navigator.serviceWorker.ready.then(readyRegistration => {
    console.log('Service Worker system ready. Proceeding with registration for FCM.');
    return navigator.serviceWorker.register(swUrl.href);
  }).then((registration) => {
    console.log('Service Worker registered successfully with scope:', registration.scope);
    if (messagingService) { // Double check messaging service availability
        // @ts-ignore
        messagingService.useServiceWorker(registration);
        console.log('Firebase Messaging service worker configured.');
    } else {
        console.warn("Messaging service became unavailable before useServiceWorker call.");
        serviceWorkerRegistered = false; // Allow retry if messaging service becomes available later
    }
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
    serviceWorkerRegistered = false; // Reset flag on failure to allow potential retry if applicable
  });
};

export const registerServiceWorker = () => {
  if (typeof window === 'undefined') return;
  
  // If an attempt is already considered made (flag is true), don't re-queue or re-attempt.
  if (serviceWorkerRegistered) {
    // console.log("Registration already attempted or completed for this session.");
    return;
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // If document is already loaded or interactive, try to register soon.
    // setTimeout allows current script execution to complete and browser to settle.
    setTimeout(performSwRegistration, 0);
  } else {
    // Otherwise, wait for the load event.
    const onWindowLoad = () => {
      performSwRegistration();
      window.removeEventListener('load', onWindowLoad);
    };
    window.addEventListener('load', onWindowLoad);
  }
};

export default app;
