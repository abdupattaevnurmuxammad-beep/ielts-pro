import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCW9i82zZoCTH02UTBL-RVtfK4GdqaGkd4",
  authDomain: "ielts-nova-b89ad.firebaseapp.com",
  projectId: "ielts-nova-b89ad",
  storageBucket: "ielts-nova-b89ad.firebasestorage.app",
  messagingSenderId: "504662471353",
  appId: "1:504662471353:web:80097f00faff9adb596168"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);