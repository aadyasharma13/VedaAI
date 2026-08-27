import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; kind: string; page: string }> },
) {
  const { id, kind, page } = await params;
  const session = getSession(id);
  if (!session) return new NextResponse("Session not found", { status: 404 });

  const pageNum = parseInt(page, 10);
  const images = kind === "question-paper" ? session.questionPaperImages : kind === "answer-sheet" ? session.answerSheetImages : null;
  if (!images) return new NextResponse("Invalid kind", { status: 400 });

  const img = images.find((p) => p.page === pageNum);
  if (!img) return new NextResponse("Page not found", { status: 404 });

  const match = img.dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return new NextResponse("Corrupt image data", { status: 500 });
  const [, mimeType, base64] = match;
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
