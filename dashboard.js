import { auth, db } from "./firebase-config.js";
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) return; // auth.js already handles redirecting to login

  const historyEl = document.getElementById("history-list");
  const q = query(collection(db, "users", user.uid, "results"), orderBy("takenAt", "desc"));
  const snap = await getDocs(q);

  if (snap.empty) {
    historyEl.innerHTML = "<p>No practice tests completed yet — go take one!</p>";
    return;
  }

  let html = "";
  snap.forEach(docSnap => {
    const r = docSnap.data();
    const date = new Date(r.takenAt).toLocaleDateString();
    html += `
      <div style="display:flex; justify-content:space-between; padding:12px 16px; background:var(--card-bg); border:1px solid var(--card-border); border-radius:10px; margin-bottom:8px;">
        <span>${r.testType}</span>
        <span>${r.score}/${r.total} — Band ${r.band}</span>
        <span>${date}</span>
      </div>
    `;
  });
  historyEl.innerHTML = html;
});