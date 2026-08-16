import { auth, db } from "./firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function renderStreak(streakEl, streak) {
  streakEl.innerHTML = `
    <div class="streak-card">
      <span class="icon">☄️</span>
      <span class="streak-count">${streak}</span>
      <span class="streak-label">Day Streak</span>
    </div>
  `;
}

function renderGuest(streakEl) {
  streakEl.innerHTML = ""; // keep header clean when logged out
}

onAuthStateChanged(auth, async (user) => {
  const streakEl = document.getElementById("streak-display");
  if (!streakEl) return;

  if (!user) {
    renderGuest(streakEl);
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const data = snap.exists() ? snap.data() : {};

  const today = todayString();
  let streak = data.currentStreak || 0;
  const lastLogin = data.lastLoginDate;

  if (lastLogin === today) {
    // already counted today
  } else if (lastLogin && daysBetween(lastLogin, today) === 1) {
    streak += 1;
  } else {
    streak = 1;
  }

  await setDoc(userRef, { currentStreak: streak, lastLoginDate: today }, { merge: true });
  renderStreak(streakEl, streak);
});