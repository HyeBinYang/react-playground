import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0iIO1ov2dUv2mSKSOR2jAE7OM8ryxIP0",
  authDomain: "pharmacyhipass.firebaseapp.com",
  databaseURL: "https://pharmacyhipass-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pharmacyhipass",
  storageBucket: "pharmacyhipass.appspot.com",
  messagingSenderId: "6960128514",
  appId: "1:6960128514:web:29aeb0a1b2e1b471273d1b",
  measurementId: "G-704T5SKQ4J",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getFirestore(app);
export const storage = getStorage(app);
