import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession, toPublic } from "@/lib/store";
import { gradeAnswers } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (!session.questions || !session.answers) {
    return NextResponse.json({ error: "Questions and answers must be extracted first." }, { status: 400 });
  }

  try {
    await updateSession(sessionId, { stage: "grading" });
    const { grades, overall } = await gradeAnswers(session.questions, session.answers);
    const updated = await updateSession(sessionId, { grades, overall, stage: "done" });
    return NextResponse.json({ session: toPublic(updated!) });
  } catch (err) {
    console.error("grade error", err);
    await updateSession(sessionId, { stage: "error", error: "Failed to grade answers." });
    return NextResponse.json({ error: "Failed to grade answers. Please try again." }, { status: 502 });
  }
}
