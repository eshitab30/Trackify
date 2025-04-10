// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAflF-q5vpHh0pE4nilRsKpv4YuvAP-QmE",
    authDomain: "trackify-aec8b.firebaseapp.com",
    projectId: "trackify-aec8b",
    storageBucket: "trackify-aec8b.firebasestorage.app",
    messagingSenderId: "677318614947",
    appId: "1:677318614947:web:3f91e3bb7b56a62d294416"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);