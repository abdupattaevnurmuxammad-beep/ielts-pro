// ============================================
// IELTS NOVA — Progress card (main page)
// ============================================
import { auth, db } from "./firebase-config.js";
import { collection, query, orderBy, getDocs, limit } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  const section = document.getElementById("progress-section");
  if (!section) return;

  if (!user) {
    section.innerHTML = `
      <h2>Track Your Progress</h2>
      <p>Log in to see your scores and get personalized advice.</p>
    `;
    return;
  }

  const q = query(
    collection(db, "users", user.uid, "results"),
    orderBy("takenAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    section.innerHTML = `
      <h2>Track Your Progress</h2>
      <p>No practice tests completed yet — take one to see your progress here.</p>
    `;
    return;
  }

  const results = [];
  snap.forEach(docSnap => results.push(docSnap.data()));

  renderProgressCards(section, results);
  loadAdvice(results);
});

function latestBySkill(results) {
  const latest = {};
  results.forEach(r => {
    if (!latest[r.testType]) latest[r.testType] = r; // already sorted desc, so first hit is latest
  });
  return latest;
}

function renderProgressCards(section, results) {
  const latest = latestBySkill(results);
  const skills = ["Listening", "Reading", "Writing", "Speaking"];

  let html = `<h2>Track Your Progress</h2><div class="progress-cards">`;
  skills.forEach(skill => {
    const r = latest[skill];
    html += `
      <div class="progress-card">
        <p class="progress-skill">${skill}</p>
        <p class="progress-band">${r ? "Band " + r.band : "—"}</p>
      </div>
    `;
  });
  html += `</div><div id="ai-advice" class="advice-box">Loading advice…</div>`;
  section.innerHTML = html;
}

async function loadAdvice(results) {
  const adviceBox = document.getElementById("ai-advice");
  try {
    const res = await fetch("/api/progress-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: results.slice(0, 10) })
    });
    const data = await res.json();
    adviceBox.textContent = data.text || "Keep practicing across all four skills!";
  } catch (err) {
    adviceBox.textContent = "Keep practicing across all four skills!";
  }
}