import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhYz3I4zTAniH30e-VjIaHA4Imh1XaNj0",
  authDomain: "practice-317cc.firebaseapp.com",
  databaseURL: "https://practice-317cc-default-rtdb.firebaseio.com",
  projectId: "practice-317cc",
  storageBucket: "practice-317cc.appspot.com",
  messagingSenderId: "164798260796",
  appId: "1:164798260796:web:a3f5cb27a509921febc539",
  measurementId: "G-95P1YX0QRW",
}; // practice config

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getFirestore(app);
export const storage = getStorage(app);
