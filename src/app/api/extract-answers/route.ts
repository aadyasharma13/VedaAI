import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession, toPublic } from "@/lib/store";
import { extractAndMapAnswers } from "@/lib/ai";
import type { AnswerStatus, Question } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();
  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (!session.questions) {
    return NextResponse.json({ error: "Questions must be extracted first." }, { status: 400 });
  }
  if (session.questions.length === 0) {
    return NextResponse.json(
      { error: "No questions could be found in the question paper. Please check the file and try again." },
      { status: 422 },
    );
  }

  try {
    updateSession(sessionId, { stage: "extracting_answers" });
    const rawAnswers = await extractAndMapAnswers(session.answerSheetImages, session.questions);

    // Reconcile: mark any question with zero matched answers as unanswered by
    // synthesizing a placeholder mapping, so the UI has one uniform list to render.
    const questions: Question[] = session.questions;
    const answeredQuestionIds = new Set(rawAnswers.filter((a) => a.status === "answered" && a.questionId).map((a) => a.questionId));
    const unansweredPlaceholders = questions
      .filter((q) => !answeredQuestionIds.has(q.id))
      .map((q) => ({
        id: `unanswered-${q.id}`,
        questionId: q.id,
        matchedDisplayNumber: q.displayNumber,
        status: "unanswered" as AnswerStatus,
        regions: [],
        transcribedText: "",
        confidence: 1,
      }));

    const answers = [...rawAnswers, ...unansweredPlaceholders];
    const updated = updateSession(sessionId, { answers })!;
    return NextResponse.json({ session: toPublic(updated) });
  } catch (err) {
    console.error("extract-answers error", err);
    updateSession(sessionId, { stage: "error", error: "Failed to extract answers from the answer sheet." });
    return NextResponse.json({ error: "Failed to extract answers. Please try again." }, { status: 502 });
  }
}
