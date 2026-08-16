// ============================================
// IELTS PRO — Listening Test Engine
// Data-driven: reads `listeningTest` from listening-data.js
// Swap that file's content later — this engine stays the same.
// ============================================

// Official-style IELTS Listening raw-score -> band conversion
// (standard published conversion scale, out of 40)
const BAND_TABLE = [
  { min: 39, band: 9 },
  { min: 37, band: 8.5 },
  { min: 35, band: 8 },
  { min: 32, band: 7.5 },
  { min: 30, band: 7 },
  { min: 26, band: 6.5 },
  { min: 23, band: 6 },
  { min: 18, band: 5.5 },
  { min: 16, band: 5 },
  { min: 13, band: 4.5 },
  { min: 11, band: 4 },
  { min: 8,  band: 3.5 },
  { min: 6,  band: 3 },
  { min: 4,  band: 2.5 },
  { min: 0,  band: 2 }
];

function scoreToBand(raw) {
  for (const row of BAND_TABLE) {
    if (raw >= row.min) return row.band;
  }
  return 0;
}

// ---- State ----
let allQuestions = [];       // flat list, each tagged with sectionIndex
let userAnswers = {};        // { questionId: value }
let currentSectionIndex = 0;
let sectionTimer = null;
let sectionTimeLeft = 0;
let testStarted = false;

function flattenQuestions() {
  allQuestions = [];
  listeningTest.sections.forEach((section, sIdx) => {
    section.questions.forEach(q => {
      allQuestions.push({ ...q, sectionIndex: sIdx });
    });
  });
}

// ---- Init ----
function initListeningTest() {
  flattenQuestions();
  buildQuestionGrid();
  renderSection(0);
  document.getElementById("total-count").textContent = allQuestions.length;

  document.getElementById("prevSectionBtn").onclick = () => {
    if (currentSectionIndex > 0) renderSection(currentSectionIndex - 1);
  };
  document.getElementById("nextSectionBtn").onclick = () => {
    if (currentSectionIndex < listeningTest.sections.length - 1) {
      renderSection(currentSectionIndex + 1);
    } else {
      finishTest();
    }
  };
  document.getElementById("submitBtn").onclick = finishTest;
}

function buildQuestionGrid() {
  const grid = document.getElementById("question-grid");
  let html = "";
  allQuestions.forEach((q, i) => {
    html += `<div class="question-box" id="box-${q.id}" onclick="jumpToQuestion(${q.id})">${q.id}</div>`;
  });
  grid.innerHTML = html;
}

function jumpToQuestion(qId) {
  const q = allQuestions.find(x => x.id === qId);
  if (!q) return;
  renderSection(q.sectionIndex, qId);
}

// ---- Section rendering ----
function renderSection(index, scrollToQId) {
  currentSectionIndex = index;
  const section = listeningTest.sections[index];

  document.getElementById("section-title").textContent = section.title;
  document.getElementById("section-context").textContent = section.context || "";

  const audioEl = document.getElementById("audio");
  audioEl.src = section.audio;
  audioEl.load();

  const container = document.getElementById("questions-container");
  container.innerHTML = section.questions.map(renderQuestion).join("");

  document.getElementById("prevSectionBtn").disabled = index === 0;
  document.getElementById("nextSectionBtn").textContent =
    index === listeningTest.sections.length - 1 ? "Finish Test" : "Next Section →";

  restoreAnswersForSection(section);
  attachAnswerListeners(section);
  updateProgress();
  updateGridHighlight();

  if (scrollToQId) {
    const el = document.getElementById(`q-${scrollToQId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function renderQuestion(q) {
  let inner = "";

  if (q.type === "fill_blank") {
    inner = `<input type="text" class="answer-input" data-qid="${q.id}" placeholder="Type your answer">`;
  }

  if (q.type === "multiple_choice") {
    inner = q.options.map((opt, i) => `
      <label>
        <input type="radio" name="q-${q.id}" data-qid="${q.id}" value="${i}">
        ${opt}
      </label>
    `).join("");
  }

  if (q.type === "matching") {
    inner = q.items.map(item => `
      <div class="match-row">
        <span class="match-item">${item}</span>
        <select data-qid="${q.id}" data-item="${item}">
          <option value="">— choose —</option>
          ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
        </select>
      </div>
    `).join("");
  }

  return `
    <div class="question-block" id="q-${q.id}">
      <p class="q-prompt"><strong>${q.id}.</strong> ${q.prompt}</p>
      <div class="q-answer-area">${inner}</div>
    </div>
  `;
}

// ---- Answer capture ----
function attachAnswerListeners(section) {
  section.questions.forEach(q => {
    if (q.type === "fill_blank") {
      const input = document.querySelector(`input.answer-input[data-qid="${q.id}"]`);
      if (input) input.addEventListener("input", () => {
        userAnswers[q.id] = input.value.trim();
        updateGridHighlight();
      });
    }
    if (q.type === "multiple_choice") {
      document.querySelectorAll(`input[name="q-${q.id}"]`).forEach(radio => {
        radio.addEventListener("change", () => {
          userAnswers[q.id] = parseInt(radio.value, 10);
          updateGridHighlight();
        });
      });
    }
    if (q.type === "matching") {
      document.querySelectorAll(`select[data-qid="${q.id}"]`).forEach(sel => {
        sel.addEventListener("change", () => {
          if (!userAnswers[q.id]) userAnswers[q.id] = {};
          userAnswers[q.id][sel.dataset.item] = sel.value;
          updateGridHighlight();
        });
      });
    }
  });
}

function restoreAnswersForSection(section) {
  section.questions.forEach(q => {
    const saved = userAnswers[q.id];
    if (saved === undefined) return;

    if (q.type === "fill_blank") {
      const input = document.querySelector(`input.answer-input[data-qid="${q.id}"]`);
      if (input) input.value = saved;
    }
    if (q.type === "multiple_choice") {
      const radio = document.querySelector(`input[name="q-${q.id}"][value="${saved}"]`);
      if (radio) radio.checked = true;
    }
    if (q.type === "matching") {
      Object.entries(saved).forEach(([item, val]) => {
        const sel = document.querySelector(`select[data-qid="${q.id}"][data-item="${item}"]`);
        if (sel) sel.value = val;
      });
    }
  });
}

// ---- Progress / grid ----
function isAnswered(q) {
  const val = userAnswers[q.id];
  if (val === undefined) return false;
  if (q.type === "matching") return Object.keys(val).length === q.items.length;
  return val !== "";
}

function updateProgress() {
  const answeredCount = allQuestions.filter(isAnswered).length;
  const pct = (answeredCount / allQuestions.length) * 100;
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("answered-count").textContent = answeredCount;
}

function updateGridHighlight() {
  allQuestions.forEach(q => {
    const box = document.getElementById(`box-${q.id}`);
    if (!box) return;
    box.classList.toggle("answered", isAnswered(q));
    box.classList.toggle("current-section", q.sectionIndex === currentSectionIndex);
  });
  updateProgress();
}

// ---- Scoring ----
function normalize(str) {
  return String(str).trim().toLowerCase().replace(/\s+/g, " ");
}

function gradeTest() {
  let correct = 0;
  const breakdown = [];

  allQuestions.forEach(q => {
    let isCorrect = false;
    const given = userAnswers[q.id];

    if (q.type === "fill_blank") {
      isCorrect = given !== undefined && normalize(given) === normalize(q.answer);
    }
    if (q.type === "multiple_choice") {
      isCorrect = given === q.correct;
    }
    if (q.type === "matching") {
      isCorrect = given && q.items.every(item => given[item] === q.correct[item]);
    }

    if (isCorrect) correct++;
    breakdown.push({ id: q.id, prompt: q.prompt, correct: isCorrect });
  });

  return { correct, total: allQuestions.length, breakdown };
}

// ---- Finish / results ----
function finishTest() {
  const result = gradeTest();
  const band = scoreToBand(result.correct);

  document.getElementById("test-view").style.display = "none";
  const resultsView = document.getElementById("results-view");
  resultsView.style.display = "block";

  document.getElementById("result-score").textContent = `${result.correct} / ${result.total}`;
  document.getElementById("result-band").textContent = band;

  const list = document.getElementById("result-breakdown");
  list.innerHTML = result.breakdown.map(r => `
    <div class="breakdown-row ${r.correct ? "correct" : "wrong"}">
      <span>Q${r.id}</span>
      <span>${r.prompt}</span>
      <span>${r.correct ? "✅" : "❌"}</span>
    </div>
  `).join("");

  if (window.saveTestResult) {
    window.saveTestResult("Listening", result, band);   // ← new line
  }
}
function retakeTest() {
  userAnswers = {};
  currentSectionIndex = 0;
  document.getElementById("results-view").style.display = "none";
  document.getElementById("test-view").style.display = "block";
  renderSection(0);
}

// ---- Start ----
window.addEventListener("DOMContentLoaded", initListeningTest);