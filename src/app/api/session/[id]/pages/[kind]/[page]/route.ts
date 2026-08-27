import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/store";
import { readPageImage } from "@/lib/blob";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; kind: string; page: string }> },
) {
  const { id, kind, page } = await params;
  const session = await getSession(id);
  if (!session) return new NextResponse("Session not found", { status: 404 });

  const pageNum = parseInt(page, 10);
  const refs = kind === "question-paper" ? session.questionPaperImageRefs : kind === "answer-sheet" ? session.answerSheetImageRefs : null;
  if (!refs) return new NextResponse("Invalid kind", { status: 400 });

  const ref = refs.find((r) => r.page === pageNum);
  if (!ref) return new NextResponse("Page not found", { status: 404 });

  const file = await readPageImage(ref.blobPathname);
  if (!file) return new NextResponse("Page image not found in storage", { status: 404 });

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
