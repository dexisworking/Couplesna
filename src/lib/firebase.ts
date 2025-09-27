
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
    "projectId": "studio-7921805333-e23fb",
    "appId": "1:745439024438:web:af58a654d8d3ef7c980f97",
    "storageBucket": "studio-7921805333-e23fb.firebasestorage.app",
    "apiKey": "AIzaSyBBL5kYGh4SGBNYHBLkSh2DvuzjdByWc7c",
    "authDomain": "studio-7921805333-e23fb.firebaseapp.com",
    "measurementId": "",
    "messagingSenderId": "745439024438"
};

// Function to robustly get the Firebase app instance.
function getClientSideFirebaseApp(): FirebaseApp {
    if (getApps().length > 0) {
        return getApp();
    }
    return initializeApp(firebaseConfig);
}

export { getClientSideFirebaseApp };
