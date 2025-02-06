// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0dxRYNjmnxhwwIRx8ufbtwG7fPT3Ndto",
  authDomain: "task-management--app-1171f.firebaseapp.com",
  projectId: "task-management--app-1171f",
  storageBucket: "task-management--app-1171f.firebasestorage.app",
  messagingSenderId: "1806622973",
  appId: "1:1806622973:web:0bde2ba9d11ab7f0461e94",
  measurementId: "G-EHS28D9WFV"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
export {app,auth,db}

 