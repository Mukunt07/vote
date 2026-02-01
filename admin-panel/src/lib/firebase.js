import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB_mGKa8UEqFjNbWQ6rbrmlW9cvtmkd99o",
    authDomain: "election2026-60409.firebaseapp.com",
    projectId: "election2026-60409",
    storageBucket: "election2026-60409.firebasestorage.app",
    messagingSenderId: "1086748790814",
    appId: "1:1086748790814:web:115ce16bae862f13e01e0f",
    measurementId: "G-FRW05G7N5F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
