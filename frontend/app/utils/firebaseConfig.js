import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Firebase 설정 객체
const firebaseConfig = {
  apiKey:
    Constants.expoConfig?.extra?.firebaseApiKey ||
    Constants.manifest?.extra?.firebaseApiKey,
  authDomain:
    Constants.expoConfig?.extra?.firebaseAuthDomain ||
    Constants.manifest?.extra?.firebaseAuthDomain,
  projectId:
    Constants.expoConfig?.extra?.firebaseProjectId ||
    Constants.manifest?.extra?.firebaseProjectId,
  storageBucket:
    Constants.expoConfig?.extra?.firebaseStorageBucket ||
    Constants.manifest?.extra?.firebaseStorageBucket,
  messagingSenderId:
    Constants.expoConfig?.extra?.firebaseMessagingSenderId ||
    Constants.manifest?.extra?.firebaseMessagingSenderId,
  appId:
    Constants.expoConfig?.extra?.firebaseAppId ||
    Constants.manifest?.extra?.firebaseAppId,
  measurementId:
    Constants.expoConfig?.extra?.firebaseMeasurementId ||
    Constants.manifest?.extra?.firebaseMeasurementId,
};

// Firebase 앱 초기화
const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase Auth 초기화 및 AsyncStorage 설정
const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore 초기화
const firestore = getFirestore(firebaseApp);

export { auth, firestore };
export default firebaseApp;
