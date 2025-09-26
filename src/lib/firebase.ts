
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    "projectId": "studio-7921805333-e23fb",
    "appId": "1:745439024438:web:af58a654d8d3ef7c980f97",
    "storageBucket": "studio-7921805333-e23fb.firebasestorage.app",
    "apiKey": "AIzaSyBBL5kYGh4SGBNYHBLkSh2DvuzjdByWc7c",
    "authDomain": "studio-7921805333-e23fb.firebaseapp.com",
    "measurementId": "",
    "messagingSenderId": "745439024438"
};

function getClientSideFirebaseApp() {
    if (typeof window !== 'undefined') {
        return !getApps().length ? initializeApp(firebaseConfig) : getApp();
    }
    return null;
}

const app = getClientSideFirebaseApp();
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;


export { app, db, auth, getClientSideFirebaseApp };
