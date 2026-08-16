import { auth, db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

window.saveTestResult = async function (testType, result, band) {
  const user = auth.currentUser;
  if (!user) return; // not logged in — just skip, don't block the results screen

  try {
    await addDoc(collection(db, "users", user.uid, "results"), {
      testType: testType,
      score: result.correct,
      total: result.total,
      band: band,
      takenAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("Could not save result:", err);
  }
};