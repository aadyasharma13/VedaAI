import { GoogleGenAI } from "@google/genai";
import type { PageImage, Question, AnswerMapping, GradeResult, OverallFeedback } from "@/types";

// Uses Google's Gemini API (free tier) for vision + reasoning: reading
// printed question papers and handwritten answer sheets, mapping answers to
// questions, and grading. gemini-3.6-flash is fast, free-tier friendly, and
// has strong native PDF/image understanding.
const MODEL = "gemini-3.6-flash";

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

function imageParts(pages: PageImage[]) {
  return pages.flatMap((p) => {
    const match = p.dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) return [];
    const [, mimeType, data] = match;
    return [{ text: `--- Page ${p.page} ---` }, { inlineData: { mimeType, data } }];
  });
}

/** Extracts a fenced or bare JSON object/array from a model text response. */
function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.search(/[[{]/);
  const jsonStr = start >= 0 ? raw.slice(start) : raw;
  return JSON.parse(jsonStr.trim());
}

async function callWithRetry<T>(fn: () => Promise<string>, parse: (t: string) => T, retries = 1): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const text = await fn();
      return parse(text);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

// ---------- Phase 1: Question extraction ----------

export async function extractQuestions(pages: PageImage[]): Promise<Question[]> {
  const ai = client();

  const raw = await callWithRetry(
    async () => {
      const res = await ai.models.generateContent({
        model: MODEL,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `You are an expert exam-paper parser. You read scanned/printed question paper pages and extract every question in exact printed order.

Rules:
- Treat labelled sub-parts as SEPARATE entries. E.g. question 11 with parts (a) and (b) becomes two entries: displayNumber "11 (a)" and "11 (b)".
- Preserve the EXACT printed numbering style (e.g. "Q1", "2.", "3(iii)", "Section A, Q1").
- baseNumber is the grouping root without the subpart, e.g. "11" for "11 (a)".
- subpart is the sub-label only (e.g. "a", "iii"), or null if there is none.
- Include the full question text verbatim (OCR it faithfully, fix only obvious OCR noise).
- If marks are printed (e.g. "[5 marks]", "(2)"), extract as maxMarks (number), else null.
- order must reflect the exact top-to-bottom, left-to-right printed reading order across all pages, starting at 0.
- page is the 1-indexed page number (matching the "--- Page N ---" markers) the question appears on.
- Do not invent questions that aren't present. Do not skip any question or sub-part.
- Output ONLY a JSON array, no prose, matching this TypeScript type exactly:
  { id: string; displayNumber: string; baseNumber: string; subpart: string | null; text: string; maxMarks: number | null; page: number; order: number }[]
- id should be a short slug like "q-11-a" or "q-3".`,
        },
        contents: [
          {
            role: "user",
            parts: [{ text: "Extract every question from this question paper, in printed order:" }, ...imageParts(pages)],
          },
        ],
      });
      return res.text ?? "";
    },
    (t) => extractJson<Question[]>(t),
  );

  return raw.map((q, i) => ({ ...q, order: q.order ?? i })).sort((a, b) => a.order - b.order);
}

// ---------- Phase 2: Answer extraction + mapping ----------

export async function extractAndMapAnswers(
  answerPages: PageImage[],
  questions: Question[],
): Promise<AnswerMapping[]> {
  const ai = client();

  const questionList = questions
    .map((q) => `- ${q.displayNumber} (id: ${q.id}): ${q.text.slice(0, 200)}`)
    .join("\n");

  const raw = await callWithRetry(
    async () => {
      const res = await ai.models.generateContent({
        model: MODEL,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `You are an expert at reading handwritten student answer sheets and mapping each answer to the question it responds to.

You are given:
1. A list of known questions with their ids and printed display numbers.
2. Images of every page of one student's answer sheet.

Task: segment the answer sheet into answer regions and map each region to a question.

Rules:
- Students may answer out of order, skip questions, or write answers that don't correspond to any known question — handle all of these.
- For each answer region you find, determine which question number the student wrote (look for numbering like "Q11(a)", "11 a)", "Ans 3", etc. in their handwriting) or infer from content/position if unlabeled.
- questionId: the matching id from the known question list, or null if you cannot confidently match it to any known question.
- matchedDisplayNumber: the display number you believe this answers (even a guess), or null if you truly cannot tell.
- status: "answered" if matched to a known question, "unmatched" if it's an answer-like region with no confident question match. (Do not emit "unanswered" here — that is computed separately for questions with zero matches.)
- regions: an array of bounding boxes, one per page the answer spans. Each box uses NORMALIZED coordinates in [0,1] relative to that page's width/height: { page, x, y, w, h } where (x,y) is the top-left corner. Tightly bound just the handwritten answer content (not the whole page). If an answer continues across multiple pages, include multiple entries in regions, one per page, each page number matching the "--- Page N ---" markers.
- transcribedText: your best-effort transcription of the handwritten answer (used for grading later). Transcribe as accurately as possible even if handwriting is messy.
- confidence: 0 to 1, how confident you are in the question match.
- Every distinguishable answer block should produce one entry, even ones you can't match (status "unmatched", questionId null).
- Output ONLY a JSON array, no prose, matching this TypeScript type exactly:
  { id: string; questionId: string | null; matchedDisplayNumber: string | null; status: "answered" | "unmatched"; regions: { page: number; x: number; y: number; w: number; h: number }[]; transcribedText: string; confidence: number }[]

Known questions:
${questionList}`,
        },
        contents: [
          {
            role: "user",
            parts: [{ text: "Here is the student's answer sheet. Segment and map every answer:" }, ...imageParts(answerPages)],
          },
        ],
      });
      return res.text ?? "";
    },
    (t) => extractJson<AnswerMapping[]>(t),
  );

  return raw;
}

// ---------- Phase 3: Grading ----------

export async function gradeAnswers(
  questions: Question[],
  answers: AnswerMapping[],
): Promise<{ grades: GradeResult[]; overall: OverallFeedback }> {
  const ai = client();

  const pairs = questions.map((q) => {
    const matched = answers.filter((a) => a.questionId === q.id);
    return {
      questionId: q.id,
      displayNumber: q.displayNumber,
      questionText: q.text,
      maxMarks: q.maxMarks,
      studentAnswer: matched.length ? matched.map((m) => m.transcribedText).join("\n---\n") : null,
    };
  });

  const raw = await callWithRetry(
    async () => {
      const res = await ai.models.generateContent({
        model: MODEL,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `You are an experienced, fair exam grader. For each question below, grade the student's transcribed answer.

Rules:
- If studentAnswer is null, the question was not attempted: score 0, verdict "not_attempted", feedback "Not attempted."
- Otherwise assess correctness against the question. If maxMarks is given, score out of that; otherwise score out of 10.
- verdict: "correct" | "partial" | "incorrect" | "not_attempted".
- feedback: 1-3 concise, constructive sentences addressed to the student.
- Also produce an overall summary: total score, total max, counts, and a short (2-4 sentence) overall feedback paragraph for the teacher summarizing performance, strengths, and gaps.
- Output ONLY JSON, no prose, matching this TypeScript type exactly:
  { grades: { questionId: string; score: number; maxScore: number; verdict: "correct"|"partial"|"incorrect"|"not_attempted"; feedback: string }[]; overall: { totalScore: number; totalMax: number; answeredCount: number; unansweredCount: number; unmatchedCount: number; summary: string } }`,
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Grade these question/answer pairs:\n${JSON.stringify(pairs, null, 2)}\n\nUnmatched answer count (answers that didn't map to any question): ${
                  answers.filter((a) => a.status === "unmatched").length
                }`,
              },
            ],
          },
        ],
      });
      return res.text ?? "";
    },
    (t) => extractJson<{ grades: GradeResult[]; overall: OverallFeedback }>(t),
  );

  return raw;
}
