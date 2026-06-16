// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC9oJ2azvuXaIM_5bxn4buDbAqIjR19CDU",
  authDomain: "mhcrftbl.firebaseapp.com",
  databaseURL: "https://mhcrftbl-default-rtdb.firebaseio.com",
  projectId: "mhcrftbl",
  storageBucket: "mhcrftbl.firebasestorage.app",
  messagingSenderId: "1036525734484",
  appId: "1:1036525734484:web:18ea1219ebb0fd40c3bbc1",
  measurementId: "G-QTE3E7K5FJ",
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = true;

isSupported().then((yes) => {
  if (yes) {
    getAnalytics(app);
  }
});

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
};
