// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCimML36gK2ptUqebMqvb4cciORU6BjSkk",
  authDomain: "ajalul-amanath.firebaseapp.com",
  projectId: "ajalul-amanath",
  storageBucket: "ajalul-amanath.firebasestorage.app",
  messagingSenderId: "685251844093",
  appId: "1:685251844093:web:e857252ec22502cc29ab94"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Admin email
export const ADMIN_EMAIL = "artonovia@gmail.com";

export default app;