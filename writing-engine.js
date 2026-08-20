// ============================================
// IELTS PRO — Writing Engine (client side)
// Talks ONLY to your own backend (/api/writing-feedback)
// ============================================

const taskType = document.getElementById("task-type");
const promptInput = document.getElementById("prompt-input");
const essayInput = document.getElementById("essay-input");
const wordCount = document.getElementById("word-count");
const submitBtn = document.getElementById("submitBtn");

essayInput.addEventListener("input", () => {
  const words = essayInput.value.trim().split(/\s+/).filter(Boolean).length;
  wordCount.textContent = `${words} words`;
});

submitBtn.addEventListener("click", async () => {
  const essay = essayInput.value.trim();
  if (!essay) {
    alert("Please write or paste your essay first.");
    return;
  }

  document.getElementById("input-view").style.display = "none";
  document.getElementById("loading-view").style.display = "block";

  try {
    const res = await fetch("/api/writing-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskType: taskType.value,
        prompt: promptInput.value.trim(),
        essay
      })
    });
    const data = await res.json();

    document.getElementById("loading-view").style.display = "none";

    if (data.error) {
      document.getElementById("input-view").style.display = "block";
      alert("Error: " + data.error);
      return;
    }

    showFeedback(data.text);
  } catch (err) {
    document.getElementById("loading-view").style.display = "none";
    document.getElementById("input-view").style.display = "block";
    alert("Connection error. Is the server running?");
  }
});

function showFeedback(raw) {
  const resultsView = document.getElementById("results-view");
  resultsView.style.display = "block";

  const body = raw.includes("---FEEDBACK---")
    ? raw.split("---FEEDBACK---")[1].split("---END---")[0].trim()
    : raw.trim();

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