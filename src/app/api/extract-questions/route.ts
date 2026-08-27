import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession, toPublic } from "@/lib/store";
import { extractQuestions } from "@/lib/ai";
import { refsToPageImages } from "@/lib/blob";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

  try {
    await updateSession(sessionId, { stage: "extracting_questions" });
    const pages = await refsToPageImages(session.questionPaperImageRefs);
    const questions = await extractQuestions(pages);

    if (questions.length === 0) {
      await updateSession(sessionId, {
        questions,
        stage: "error",
        error: "No questions could be found in the question paper. Please check the file and try again.",
      });
      return NextResponse.json(
        { error: "No questions could be found in the question paper. Please check the file and try again." },
        { status: 422 },
      );
    }

    const updated = await updateSession(sessionId, { questions });
    return NextResponse.json({ session: toPublic(updated!) });
  } catch (err) {
    console.error("extract-questions error", err);
    await updateSession(sessionId, { stage: "error", error: "Failed to extract questions from the question paper." });
    return NextResponse.json({ error: "Failed to extract questions. Please try again." }, { status: 502 });
  }
}
