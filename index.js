// ============================================
// IELTS PRO — Speaking Examiner (Firebase Cloud Function)
// Key lives in Google Cloud Secret Manager, never in
// client code or in your repo.
// ============================================

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const geminiApiKey = defineSecret("GEMINI_API_KEY");

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
  connected to the Part 2 topic. Push gently for reasoning ("why do you think
  that?", "how has that changed over time?").

Rules:
- Ask exactly ONE question or give ONE instruction per turn. Never ask multiple
  questions at once.
- Sound like a real, professional but warm examiner — natural spoken English,
  not robotic.
- You receive the candidate's actual voice recording for each answer (not just
  a transcript) — listen for pronunciation, pacing, hesitation, filler words,
  stress and intonation, in addition to grammar and vocabulary.
- Keep track of which part of the test you are in using the conversation history.
- When the test reaches the end of Part 3 (after ~4-5 exchanges), stop asking
  questions and instead output the FINAL FEEDBACK in this exact format:

  ---FEEDBACK---
  Fluency and Coherence: <band 1-9> — <2-3 sentence justification>
  Lexical Resource: <band 1-9> — <2-3 sentence justification>
  Grammatical Range and Accuracy: <band 1-9> — <2-3 sentence justification>
  Pronunciation: <band 1-9> — <2-3 sentence justification, based on what you heard>
  Overall Band: <average, rounded to nearest 0.5>
  Strengths: <2-3 bullet points>
  Areas to improve: <2-3 bullet points, specific and actionable>
  ---END---

- Never break character to explain that you are an AI, unless the candidate
  directly asks.
- This is practice feedback from an AI, not an official IELTS score — keep
  language encouraging but honest.
`;

exports.examiner = onRequest(
  { secrets: [geminiApiKey], cors: true, region: "us-central1", timeoutSeconds: 60 },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { history, audioBase64, audioMimeType } = req.body;

      const contents = (history || []).map(turn => ({
        role: turn.role,
        parts: [{ text: turn.text }]
      }));

      if (audioBase64) {
        contents.push({
          role: "user",
          parts: [
            { text: "(Candidate's spoken answer, attached as audio.)" },
            {
              inline_data: {
                mime_type: audioMimeType || "audio/webm",
                data: audioBase64
              }
            }
          ]
        });
      } else {
        contents.push({
          role: "user",
          parts: [{ text: "Please begin the IELTS Speaking test with Part 1." }]
        });
      }

      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey.value()
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Gemini API error:", data);
        return res.status(502).json({ error: "Gemini API error", details: data });
      }

      const examinerText =
        data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

      res.json({ text: examinerText });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
);