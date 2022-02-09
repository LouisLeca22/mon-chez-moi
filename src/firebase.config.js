// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyATvi7r4F-ZZ0JPH9CmorwIWULMvqy9K_E",
  authDomain: "house-marketplace-app-495b5.firebaseapp.com",
  projectId: "house-marketplace-app-495b5",
  storageBucket: "house-marketplace-app-495b5.appspot.com",
  messagingSenderId: "69089782727",
  appId: "1:69089782727:web:b83f1242836c1f1b6787e2"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()