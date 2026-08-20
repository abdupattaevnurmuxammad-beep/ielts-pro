// ============================================
// IELTS PRO — Speaking Engine (client side)
// Talks ONLY to your own backend (/api/examiner),
// never directly to Gemini — the API key stays
// on the server.
// ============================================

let history = [];        // { role: "user"|"model", text: "..." }
let mediaRecorder = null;
let audioChunks = [];
let currentPart = 1;
let exchangeCount = 0;
const MAX_EXCHANGES_BEFORE_WRAP = 9; // rough length of a full test

const startBtn = document.getElementById("startBtn");
const recordBtn = document.getElementById("recordBtn");
const examinerText = document.getElementById("examiner-text");
const partBadge = document.getElementById("part-badge");
const recStatus = document.getElementById("rec-status");
const prepTimerEl = document.getElementById("prep-timer");
const prepSecondsEl = document.getElementById("prep-seconds");

startBtn.addEventListener("click", startTest);

async function startTest() {
  document.getElementById("intro-view").style.display = "none";
  document.getElementById("test-view").style.display = "block";
  history.push({ role: "user", text: "Please begin the IELTS Speaking test with Part 1." });
  await requestExaminerTurn(null);
}

// ---- Talk to backend ----
async function requestExaminerTurn(audioBase64, audioMimeType) {
  setStatus("Examiner is thinking…");
  recordBtn.disabled = true;

  try {
    const res = await fetch("https://ielts-pro-r0me.onrender.com/api/examiner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, audioBase64, audioMimeType })
    });
    const data = await res.json();

    if (data.error) {
      examinerText.textContent = "⚠️ " + data.error;
      setStatus("");
      recordBtn.disabled = false;
      return;
    }

    const reply = data.text || "";

    if (reply.includes("---FEEDBACK---")) {
      showFeedback(reply);
      return;
    }

    history.push({ role: "model", text: reply });
    examinerText.textContent = reply;
    speak(reply);
    updatePartBadge(reply);
    maybeStartPrepTimer(reply);

    setStatus("");
    recordBtn.disabled = false;
  } catch (err) {
    examinerText.textContent = "⚠️ Connection error. Is the server running?";
    setStatus("");
    recordBtn.disabled = false;
  }
}

// ---- Text-to-speech for the examiner ----
let cachedVoices = [];

function loadVoices() {
  cachedVoices = speechSynthesis.getVoices();
}
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = loadVoices;
}

function pickEnglishVoice() {
  return (
    cachedVoices.find(v => v.lang === "en-US" && /Google|Natural|Online/i.test(v.name)) ||
    cachedVoices.find(v => v.lang === "en-GB") ||
    cachedVoices.find(v => v.lang === "en-US") ||
    cachedVoices.find(v => v.lang && v.lang.startsWith("en"))
  );
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  const voice = pickEnglishVoice();
  if (voice) utter.voice = voice;
  utter.rate = 0.98;
  utter.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}
// ---- Part / prep-timer heuristics based on examiner's own wording ----
function updatePartBadge(text) {
  const lower = text.toLowerCase();
  if (lower.includes("part 2") || lower.includes("cue card")) {
    currentPart = 2;
  } else if (lower.includes("part 3")) {
    currentPart = 3;
  }
  partBadge.textContent = `Part ${currentPart}`;
}

function maybeStartPrepTimer(text) {
  const lower = text.toLowerCase();
  if (currentPart === 2 && (lower.includes("1 minute") || lower.includes("cue card"))) {
    runPrepTimer(60);
  } else {
    prepTimerEl.style.display = "none";
  }
}

function runPrepTimer(seconds) {
  prepTimerEl.style.display = "block";
  let remaining = seconds;
  prepSecondsEl.textContent = remaining;
  const interval = setInterval(() => {
    remaining--;
    prepSecondsEl.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(interval);
      prepTimerEl.style.display = "none";
    }
  }, 1000);
}

// ---- Recording the candidate's real voice ----
let isRecording = false;

recordBtn.addEventListener("click", () => {
  if (!isRecording) {
    startRecording();
    isRecording = true;
    recordBtn.textContent = "⏹️ Click to Stop";
  } else {
    stopRecording();
    isRecording = false;
    recordBtn.textContent = "🎙️ Click to Answer";
  }
});
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.start();
    recordBtn.classList.add("recording");
    setStatus("🔴 Recording… release to send");
  } catch (err) {
    setStatus("⚠️ Microphone access denied.");
  }
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state !== "recording") return;
  mediaRecorder.stop();
  recordBtn.classList.remove("recording");

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const base64 = await blobToBase64(blob);

    history.push({ role: "user", text: "(spoken answer, sent as audio)" });

    exchangeCount++;
    await requestExaminerTurn(base64, "audio/webm");
  };
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function setStatus(msg) {
  recStatus.textContent = msg;
}

// ---- Final feedback screen ----
function showFeedback(raw) {
  document.getElementById("test-view").style.display = "none";
  const resultsView = document.getElementById("results-view");
  resultsView.style.display = "block";

  const body = raw.split("---FEEDBACK---")[1].split("---END---")[0].trim();
  const lines = body.split("\n").filter(l => l.trim());

  let html = "";
  lines.forEach(line => {
    if (line.includes(":")) {
      const [label, ...rest] = line.split(":");
      html += `<div class="feedback-row"><strong>${label.trim()}:</strong> ${rest.join(":").trim()}</div>`;
    } else {
      html += `<div class="feedback-row">${line}</div>`;
    }
  });

  document.getElementById("feedback-content").innerHTML = html;
}