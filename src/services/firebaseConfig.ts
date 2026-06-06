import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const firebaseConfig = {
  apiKey: "AIzaSyC1w-dDglx4iwYxPzW6BMhmUQBD1mGbrG0",
  authDomain: "berber-rezervasyon-d881f.firebaseapp.com",
  projectId: "berber-rezervasyon-d881f",
  storageBucket: "berber-rezervasyon-d881f.firebasestorage.app",
  messagingSenderId: "452264964354",
  appId: "1:452264964354:web:9eefa7c0c601d54153521b"
};

export const firebaseApp = initializeApp(firebaseConfig);

let auth: any;

if (Platform.OS === "web") {
  auth = getAuth(firebaseApp);
} else {
  // Web ortamında çökmeyi önlemek için sadece mobilde require ile çağırıyoruz.
  const { getReactNativePersistence } = require("firebase/auth");
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(firebaseApp);
