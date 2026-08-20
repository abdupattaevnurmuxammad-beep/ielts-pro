require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.static(path.join(__dirname)));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `
You are acting as a certified IELTS Speaking examiner for a practice app called IELTS PRO.
You conduct a realistic 3-part IELTS Speaking test:

- Part 1 (Introduction & Interview, ~4-5 minutes): ask short personal questions
  about everyday topics (home, work/study, hobbies, daily routine, etc).
  Ask ONE question at a time. After the candidate answers, ask a natural follow-up
  or move to the next question. Cover 3-4 different mini-topics total.

- Part 2 (Long Turn): give the candidate a cue card — a topic plus 3-4 bullet
  points to cover — and tell them they have 1 minute to prepare and should speak
  for 1-2 minutes. Wait for their recorded response.

- Part 3 (Discussion, ~4-5 minutes): ask more abstract, opinion-based questions
  connected to the Part 2 topic. Push gently for reasoning.

Rules:
- Start with ONE short natural greeting, e.g. "Hello! I'll be your examiner today." Then go straight into Part 1's first question in the same turn. Do not say things like "my name is ur ielts examiner."
- Ask exactly ONE question or instruction per turn.
- Sound like a real, professional but warm examiner.
- You receive the candidate's actual voice recording — listen for pronunciation,
  pacing, hesitation, filler words, stress and intonation, plus grammar/vocabulary.
- When the test reaches the end of Part 3, output FINAL FEEDBACK in this format:

  ---FEEDBACK---
  Fluency and Coherence: <band 1-9> — <justification>
  Lexical Resource: <band 1-9> — <justification>
  Grammatical Range and Accuracy: <band 1-9> — <justification>
  Pronunciation: <band 1-9> — <justification>
  Overall Band: <average, rounded to nearest 0.5>
  Strengths: <2-3 bullet points>
  Areas to improve: <2-3 bullet points>
  ---END---

- This is AI practice feedback, not an official IELTS score.
`;
const WRITING_SYSTEM_INSTRUCTION = `
You are a certified IELTS Writing examiner for a practice app called IELTS PRO.
You will receive: the task type, optionally the exact task question, and the
candidate's full essay.

Evaluate strictly using official IELTS Writing band descriptors:
- Task Achievement / Task Response
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy

Be honest — do not inflate scores. Reference specific words or sentences from
the essay in your justifications.

Respond ONLY in this exact format:

---FEEDBACK---
Task Achievement: <band 1-9> — <justification>
Coherence and Cohesion: <band 1-9> — <justification>
Lexical Resource: <band 1-9> — <justification>
Grammatical Range and Accuracy: <band 1-9> — <justification>
Overall Band: <average, rounded to nearest 0.5>
Strengths: <2-3 bullet points>
Areas to improve: <2-3 bullet points>
Suggested rewrite of one weak sentence: <pick one from the essay, show improved version>
---END---

This is AI practice feedback, not an official IELTS score.
`;

app.post("/api/writing-feedback", async (req, res) => {
  try {
    const { taskType, prompt, essay } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
    }
    if (!essay || !essay.trim()) {
      return res.status(400).json({ error: "No essay provided." });
    }

    const userText = `Task Type: ${taskType || "Task 2"}\n` +
      (prompt ? `Task Question: ${prompt}\n\n` : "\n") +
      `Candidate's Essay:\n${essay}`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: WRITING_SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: userText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "Gemini API error", details: data });
    }

    const feedbackText = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
    res.json({ text: feedbackText });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
app.post("/api/examiner", async (req, res) => {
  try {
    const { history, audioBase64, audioMimeType } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
    }

    const contents = (history || []).map(turn => ({
      role: turn.role,
      parts: [{ text: turn.text }]
    }));
if (audioBase64) {
      contents.push({
        role: "user",
        parts: [
          { text: "(Candidate's spoken answer, attached as audio.)" },
          { inline_data: { mime_type: audioMimeType || "audio/webm", data: audioBase64 } }
        ]
      });
    }
    // если аудио нет — это самый первый вызов, и стартовая реплика
    // уже пришла в history с фронта, дублировать её не нужно
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] }, contents })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "Gemini API error", details: data });
    }

    const examinerText = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";
    res.json({ text: examinerText });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IELTS PRO server running on port ${PORT}`);
});