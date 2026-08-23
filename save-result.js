// ============================================
// IELTS NOVA — shared result saving + parsing
// ============================================
import { auth, db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Save one completed test's result to Firestore.
// Skips silently if the student isn't logged in.
export async function saveResult({ testType, score, total, band, breakdown }) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, "users", user.uid, "results"), {
      testType,
      score,
      total,
      band,
      breakdown: breakdown || null,
      takenAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Failed to save result:", err);
  }
}

// Pull "Label: number" pairs out of an AI feedback block, e.g.
// "Fluency and Coherence: 6 — good pacing" -> { "Fluency and Coherence": 6 }
export function parseBandCriteria(rawFeedback) {
  const body = rawFeedback.includes("---FEEDBACK---")
    ? rawFeedback.split("---FEEDBACK---")[1].split("---END---")[0]
    : rawFeedback;

  const criteria = {};
  body.split("\n").forEach(line => {
    const match = line.match(/^([A-Za-z ]+):\s*([\d.]+)/);
    if (match) {
      const value = parseFloat(match[2]);
      if (!isNaN(value) && value <= 9) {
        criteria[match[1].trim()] = value;
      }
    }
  });
  return criteria;
}