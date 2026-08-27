import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createSession, updateSession, toPublic } from "@/lib/store";
import { fileToPageImages } from "@/lib/pdf";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AnswerMapping, GradeResult, OverallFeedback, Question } from "@/types";

// DEV-ONLY: seeds a session with a real rendered image (reused as a stand-in
// answer sheet) plus fabricated question/answer/grade data, so the workspace
// UI (highlighting, question list, grading) can be exercised without a live
// Gemini API call. Not used in the real pipeline.
export const runtime = "nodejs";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 403 });
  }

  const pdfPath = path.join(process.cwd(), "..", "pdfs", "Upload Screen - Empty State.pdf");
  const buf = await readFile(pdfPath);
  const images = await fileToPageImages(buf, "application/pdf");
  // Duplicate as a fake second page to test multi-page spanning.
  const pageImages = [images[0], { ...images[0], page: 2 }];

  const id = uuid();
  createSession(id);

  const questions: Question[] = [
    { id: "q-1", displayNumber: "1", baseNumber: "1", subpart: null, text: "Define Newton's second law of motion.", maxMarks: 5, page: 1, order: 0 },
    { id: "q-2", displayNumber: "2", baseNumber: "2", subpart: null, text: "Explain the process of photosynthesis in plants.", maxMarks: 10, page: 1, order: 1 },
    { id: "q-11-a", displayNumber: "11 (a)", baseNumber: "11", subpart: "a", text: "Derive the equation of motion s = ut + 1/2at^2.", maxMarks: 5, page: 2, order: 2 },
    { id: "q-11-b", displayNumber: "11 (b)", baseNumber: "11", subpart: "b", text: "A car accelerates from rest at 2 m/s^2. Find its velocity after 5 seconds.", maxMarks: 5, page: 2, order: 3 },
    { id: "q-3", displayNumber: "3", baseNumber: "3", subpart: null, text: "What is the difference between mitosis and meiosis?", maxMarks: 10, page: 2, order: 4 },
  ];

  const answers: AnswerMapping[] = [
    {
      id: "a-1",
      questionId: "q-1",
      matchedDisplayNumber: "1",
      status: "answered",
      regions: [{ page: 1, x: 0.12, y: 0.18, w: 0.55, h: 0.08 }],
      transcribedText: "Force equals mass times acceleration, F = ma.",
      confidence: 0.92,
    },
    {
      id: "a-11a",
      questionId: "q-11-a",
      matchedDisplayNumber: "11 (a)",
      status: "answered",
      regions: [
        { page: 1, x: 0.1, y: 0.45, w: 0.6, h: 0.1 },
        { page: 2, x: 0.1, y: 0.1, w: 0.6, h: 0.12 },
      ],
      transcribedText: "Derivation spanning two pages, continued from page 1 to page 2.",
      confidence: 0.81,
    },
    {
      id: "a-11b",
      questionId: "q-11-b",
      matchedDisplayNumber: "11 (b)",
      status: "answered",
      regions: [{ page: 2, x: 0.1, y: 0.3, w: 0.5, h: 0.08 }],
      transcribedText: "v = u + at = 0 + 2*5 = 10 m/s",
      confidence: 0.88,
    },
    {
      id: "unanswered-q-2",
      questionId: "q-2",
      matchedDisplayNumber: "2",
      status: "unanswered",
      regions: [],
      transcribedText: "",
      confidence: 1,
    },
    {
      id: "unanswered-q-3",
      questionId: "q-3",
      matchedDisplayNumber: "3",
      status: "unanswered",
      regions: [],
      transcribedText: "",
      confidence: 1,
    },
    {
      id: "a-orphan-1",
      questionId: null,
      matchedDisplayNumber: null,
      status: "unmatched",
      regions: [{ page: 2, x: 0.1, y: 0.55, w: 0.5, h: 0.08 }],
      transcribedText: "Some scribbled note that doesn't map to any known question.",
      confidence: 0.3,
    },
  ];

  const grades: GradeResult[] = [
    { questionId: "q-1", score: 5, maxScore: 5, verdict: "correct", feedback: "Correct and concise definition." },
    { questionId: "q-2", score: 0, maxScore: 10, verdict: "not_attempted", feedback: "Not attempted." },
    { questionId: "q-11-a", score: 4, maxScore: 5, verdict: "partial", feedback: "Derivation mostly correct, missing one intermediate step." },
    { questionId: "q-11-b", score: 5, maxScore: 5, verdict: "correct", feedback: "Correct calculation and final answer." },
    { questionId: "q-3", score: 0, maxScore: 10, verdict: "not_attempted", feedback: "Not attempted." },
  ];

  const overall: OverallFeedback = {
    totalScore: grades.reduce((s, g) => s + g.score, 0),
    totalMax: grades.reduce((s, g) => s + g.maxScore, 0),
    answeredCount: 3,
    unansweredCount: 2,
    unmatchedCount: 1,
    summary:
      "The student shows strong grasp of mechanics (Q1, Q11) but left both biology questions unattempted. One unmatched scribble was found on page 2 that doesn't correspond to any question — worth a manual look.",
  };

  const session = updateSession(id, {
    stage: "done",
    questionPaperImages: pageImages,
    answerSheetImages: pageImages,
    questionPaperPages: pageImages.map((p) => ({ width: p.width, height: p.height })),
    answerSheetPages: pageImages.map((p) => ({ width: p.width, height: p.height })),
    questions,
    answers,
    grades,
    overall,
  })!;

  return NextResponse.json({ sessionId: id, session: toPublic(session) });
}
