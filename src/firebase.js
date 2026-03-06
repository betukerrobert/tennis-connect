import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA5989WW4QwPQ_UFRMNkcq93ytTHm_LS8A",
  authDomain: "tennis-connect-bf477.firebaseapp.com",
  projectId: "tennis-connect-bf477",
  storageBucket: "tennis-connect-bf477.firebasestorage.app",
  messagingSenderId: "408365904375",
  appId: "1:408365904375:web:2619e161ba05f6321fbef2",
  measurementId: "G-NK8ZV2KETE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
export const VAPID_KEY = "BBUwVu04Rm5j5BMe52NJ1UuPTa4iD0Qgvqko1ENW0NryM2YzFvg7HTEFSB0qdsV3gYo6jnVcYhS9Xw0aet6b19s";
