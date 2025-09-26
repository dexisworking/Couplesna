
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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

let app: FirebaseApp | null = null;

function getClientSideFirebaseApp(): FirebaseApp | null {
    if (typeof window !== 'undefined') {
        if (!app) {
             if (!getApps().length) {
                app = initializeApp(firebaseConfig);
             } else {
                app = getApp();
             }
        }
        return app;
    }
    return null;
}

export { getClientSideFirebaseApp };

    