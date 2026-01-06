import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD_a2jwBTx-9u3wNauFXWl2CrBQV4l3oMU",
  authDomain: "kitchenmanager-80fb3.firebaseapp.com",
  projectId: "kitchenmanager-80fb3",
  storageBucket: "kitchenmanager-80fb3.appspot.com",
  messagingSenderId: "628888454941",
  appId: "1:628888454941:web:0fd9d23ed00508eb1ec3f4",
  measurementId: "G-GVSDPV6Z7S"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);