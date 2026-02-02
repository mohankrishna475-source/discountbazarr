import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy....",
  authDomain: "discountbazarr-75729.firebaseapp.com",
  projectId: "discountbazarr-75729",
  storageBucket: "discountbazarr-75729.appspot.com",
  messagingSenderId: "296250920176",
  appId: "1:296250920176:web:....",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
