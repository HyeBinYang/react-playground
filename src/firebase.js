import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// PharmacyHipassDev || practice
const PROJECT_NAME = "practice";

// hipassDev
const firebaseConfig =
  PROJECT_NAME === "practice"
    ? {
        apiKey: "AIzaSyAhYz3I4zTAniH30e-VjIaHA4Imh1XaNj0",
        authDomain: "practice-317cc.firebaseapp.com",
        databaseURL: "https://practice-317cc-default-rtdb.firebaseio.com",
        projectId: "practice-317cc",
        storageBucket: "practice-317cc.appspot.com",
        messagingSenderId: "164798260796",
        appId: "1:164798260796:web:a3f5cb27a509921febc539",
        measurementId: "G-95P1YX0QRW",
      }
    : {
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
