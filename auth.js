import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

window.registerUser = async function () {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const errorEl = document.getElementById("auth-error");
  errorEl.textContent = "";

  if (!name || !email || !password) {
    errorEl.textContent = "Please fill in every field.";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString()
    });
    window.location.href = "dashboard.html";
  } catch (err) {
    errorEl.textContent = friendlyError(err.code);
  }
};

window.loginUser = async function () {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("auth-error");
  errorEl.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    errorEl.textContent = friendlyError(err.code);
  }
};

window.logoutUser = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

function friendlyError(code) {
  const messages = {
    "auth/email-already-in-use": "That email is already registered — try logging in instead.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password."
  };
  return messages[code] || "Something went wrong. Please try again.";
}

// Protects dashboard.html — redirects to login if not signed in
onAuthStateChanged(auth, (user) => {
  const nameEl = document.getElementById("user-name");
  if (nameEl) {
    if (user) {
      nameEl.textContent = user.email;
    } else {
      window.location.href = "login.html";
    }
  }
});