// ============================================
// IELTS NOVA — Reading Engine
// Sample passage + questions. Replace READING_TEST
// below with your own Cambridge-sourced content later —
// same structure, just swap the text/answers.
// ============================================

const READING_TEST = {
  title: "Passage 1: The History of Public Libraries",
  timeLimit: 20 * 60, // seconds

  passage: `Public libraries as free, publicly accessible institutions did not become common until the nineteenth century, although the concept of a place where books could be borrowed dates back much further. In ancient Mesopotamia, temple libraries held collections of clay tablets, but these were generally reserved for priests and scribes rather than ordinary citizens. Access to written knowledge, for most of history, remained the privilege of a small, literate elite.

The turn toward public access began gradually. In Britain, the Public Libraries Act of 1850 allowed local boroughs to establish libraries funded through local taxation, marking one of the first legislative steps toward free public access to books. Similar movements took hold in the United States, where industrialist Andrew Carnegie funded the construction of over 2,500 libraries worldwide between 1883 and 1929, a philanthropic effort that reshaped the landscape of public education.

Critics at the time worried that free libraries would discourage people from purchasing books, damaging the publishing industry. Others argued that libraries served a vital democratic function, giving working-class citizens the same access to information as the wealthy. This debate echoes, in some respects, modern discussions about free access to digital information and copyright.

Today, public libraries have evolved far beyond simple book lending. Many now offer internet access, community meeting spaces, and educational programs, reflecting a broader mission of supporting lifelong learning. Despite predictions that digital technology would render physical libraries obsolete, usage statistics in many countries show that libraries remain heavily used, suggesting that their role as community hubs, rather than mere book repositories, may account for their continued relevance.`,

  questions: [
    {
      id: 1,
      type: "mc",
      text: "According to the passage, temple libraries in ancient Mesopotamia were mainly used by:",
      options: ["merchants and traders", "priests and scribes", "ordinary citizens", "foreign visitors"],
      answer: "B"
    },
    {
      id: 2,
      type: "mc",
      text: "The Public Libraries Act of 1850 allowed:",
      options: [
        "private companies to sell books cheaply",
        "local boroughs to fund libraries through taxation",
        "libraries to charge a small membership fee",
        "universities to open reading rooms"
      ],
      answer: "B"
    },
    {
      id: 3,
      type: "tfng",
      text: "Andrew Carnegie funded fewer than 1,000 libraries.",
      answer: "FALSE"
    },
    {
      id: 4,
      type: "tfng",
      text: "Some critics believed free libraries could harm book sales.",
      answer: "TRUE"
    },
    {
      id: 5,
      type: "tfng",
      text: "The passage states that library usage has declined sharply because of the internet.",
      answer: "FALSE"
    },
    {
      id: 6,
      type: "fill",
      text: "The Public Libraries Act was passed in the year ______.",
      answer: "1850"
    },
    {
      id: 7,
      type: "fill",
      text: "Andrew Carnegie funded libraries between 1883 and ______.",
      answer: "1929"
    },
    {
      id: 8,
      type: "fill",
      text: "Modern libraries offer internet access, meeting spaces, and ______ programs.",
      answer: "educational"
    }
  ]
};

// ============================================

let answers = {};
let timeRemaining = READING_TEST.timeLimit;
let timerInterval = null;

const passageBox = document.getElementById("passage-box");
const questionsBox = document.getElementById("questions-box");
const questionGrid = document.getElementById("question-grid");
const timerEl = document.getElementById("timer");
const progressFill = document.getElementById("progress-fill");
const submitBtn = document.getElementById("submitBtn");
const passageTitle = document.getElementById("passage-title");

function init() {
  passageTitle.textContent = READING_TEST.title;
  renderPassage();
  renderQuestions();
  renderQuestionGrid();
  startTimer();
  setupHighlighting();
}

function renderPassage() {
  const paragraphs = READING_TEST.passage.trim().split("\n\n");
  passageBox.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join("");
}

function renderQuestions() {
  questionsBox.innerHTML = READING_TEST.questions.map(q => renderQuestion(q)).join("");

  questionsBox.querySelectorAll("input[type=radio]").forEach(input => {
    input.addEventListener("change", (e) => {
      answers[e.target.name] = e.target.value;
      updateProgress();
      updateQuestionGrid();
    });
  });

  questionsBox.querySelectorAll("input[type=text]").forEach(input => {
    input.addEventListener("input", (e) => {
      answers[e.target.dataset.qid] = e.target.value.trim();
      updateProgress();
      updateQuestionGrid();
    });
  });
}

function renderQuestion(q) {
  let html = `<div class="q-block" id="q-${q.id}"><p class="q-text">${q.id}. ${q.text}</p>`;

  if (q.type === "mc") {
    q.options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      html += `<label><input type="radio" name="q${q.id}" value="${letter}"> ${letter}. ${opt}</label>`;
    });
  } else if (q.type === "tfng") {
    ["TRUE", "FALSE", "NOT GIVEN"].forEach(opt => {
      html += `<label><input type="radio" name="q${q.id}" value="${opt}"> ${opt}</label>`;
    });
  } else if (q.type === "fill") {
    html += `<input type="text" data-qid="q${q.id}" class="fill-input" placeholder="Type your answer">`;
  }

  html += `</div>`;
  return html;
}

function renderQuestionGrid() {
  questionGrid.innerHTML = READING_TEST.questions.map(q =>
    `<div class="question-box" data-qid="q${q.id}">${q.id}</div>`
  ).join("");

  questionGrid.querySelectorAll(".question-box").forEach(box => {
    box.addEventListener("click", () => {
      document.getElementById(`q-${box.dataset.qid.slice(1)}`).scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function updateQuestionGrid() {
  document.querySelectorAll("#question-grid .question-box").forEach(box => {
    const qid = box.dataset.qid;
    if (answers[qid]) {
      box.classList.add("answered");
    } else {
      box.classList.remove("answered");
    }
  });
}

function updateProgress() {
  const total = READING_TEST.questions.length;
  const answered = Object.keys(answers).length;
  progressFill.style.width = `${(answered / total) * 100}%`;
}

function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

// ---- Highlighting (select text in the passage to mark it) ----
function setupHighlighting() {
  let toolbar = document.getElementById("highlight-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("button");
    toolbar.id = "highlight-toolbar";
    toolbar.textContent = "🖍 Highlight";
    toolbar.style.display = "none";
    document.body.appendChild(toolbar);
  }

  passageBox.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      toolbar.style.display = "block";
      toolbar.style.top = `${window.scrollY + rect.top - 40}px`;
      toolbar.style.left = `${window.scrollX + rect.left}px`;

      toolbar.onclick = () => {
        const mark = document.createElement("mark");
        mark.className = "user-highlight";
        try {
          range.surroundContents(mark);
        } catch (e) {
          // selection spans multiple elements — skip gracefully
        }
        toolbar.style.display = "none";
        selection.removeAllRanges();
      };
    } else {
      toolbar.style.display = "none";
    }
  });

  // click an existing highlight to remove it
  passageBox.addEventListener("click", (e) => {
    if (e.target.classList.contains("user-highlight")) {
      const parent = e.target.parentNode;
      while (e.target.firstChild) parent.insertBefore(e.target.firstChild, e.target);
      parent.removeChild(e.target);
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (e.target !== toolbar) toolbar.style.display = "none";
  });
}

// ---- Submission & scoring ----
submitBtn.addEventListener("click", submitTest);

function submitTest() {
  clearInterval(timerInterval);

  let correctCount = 0;
  const results = READING_TEST.questions.map(q => {
    const userAnswer = (answers[`q${q.id}`] || "").toString().trim();
    const correctAnswer = q.answer.toString().trim();
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    if (isCorrect) correctCount++;
    return { ...q, userAnswer, isCorrect };
  });

  const total = READING_TEST.questions.length;
  const percentage = (correctCount / total) * 100;
  const band = getBand(percentage);

  showResults(correctCount, total, band, results);
}

// Rough Academic Reading band conversion, based on percentage correct.
// Approximate — real IELTS bands are set per test version.
function getBand(pct) {
  if (pct >= 97.5) return 9;
  if (pct >= 92.5) return 8.5;
  if (pct >= 87.5) return 8;
  if (pct >= 82.5) return 7.5;
  if (pct >= 75) return 7;
  if (pct >= 67.5) return 6.5;
  if (pct >= 57.5) return 6;
  if (pct >= 47.5) return 5.5;
  if (pct >= 37.5) return 5;
  if (pct >= 32.5) return 4.5;
  return 4;
}

function showResults(correct, total, band, results) {
  document.querySelector(".exam-layout").style.display = "none";
  const resultsView = document.getElementById("results-view");
  resultsView.style.display = "block";

  let html = `
    <div class="feedback-row"><strong>Score:</strong> ${correct} / ${total}</div>
    <div class="feedback-row"><strong>Estimated Band:</strong> ${band} (approximate)</div>
  `;

  results.forEach(r => {
    html += `
      <div class="feedback-row ${r.isCorrect ? "correct" : "incorrect"}">
        <strong>Q${r.id}:</strong> Your answer: ${r.userAnswer || "(blank)"} —
        Correct answer: ${r.answer} ${r.isCorrect ? "✅" : "❌"}
      </div>
    `;
  });

  document.getElementById("feedback-content").innerHTML = html;
}

init();