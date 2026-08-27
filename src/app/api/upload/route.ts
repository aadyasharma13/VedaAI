import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { createSession, updateSession, toPublic } from "@/lib/store";
import { fileToPageImages } from "@/lib/pdf";
import { uploadPageImage } from "@/lib/blob";
import type { PageImage } from "@/types";
import type { StoredPageRef } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB, matches the UI copy
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);

async function storePages(sessionId: string, kind: "question-paper" | "answer-sheet", images: PageImage[]): Promise<StoredPageRef[]> {
  return Promise.all(
    images.map(async (img) => ({
      page: img.page,
      width: img.width,
      height: img.height,
      blobPathname: await uploadPageImage(sessionId, kind, img.page, img.dataUrl),
    })),
  );
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const questionPaper = form.get("questionPaper");
    const answerSheet = form.get("answerSheet");

    if (!(questionPaper instanceof File) || !(answerSheet instanceof File)) {
      return NextResponse.json({ error: "Both questionPaper and answerSheet files are required." }, { status: 400 });
    }

    for (const [label, f] of [["questionPaper", questionPaper], ["answerSheet", answerSheet]] as const) {
      if (!ALLOWED_TYPES.has(f.type)) {
        return NextResponse.json({ error: `${label}: unsupported file type "${f.type}". Use PDF, PNG, JPG, or WEBP.` }, { status: 400 });
      }
      if (f.size > MAX_SIZE) {
        return NextResponse.json({ error: `${label}: file exceeds 10MB limit.` }, { status: 400 });
      }
      if (f.size === 0) {
        return NextResponse.json({ error: `${label}: file is empty.` }, { status: 400 });
      }
    }

    const id = uuid();
    await createSession(id);
    await updateSession(id, { stage: "converting" });

    const [qBuf, aBuf] = await Promise.all([
      questionPaper.arrayBuffer().then(Buffer.from),
      answerSheet.arrayBuffer().then(Buffer.from),
    ]);

    let questionPaperImages, answerSheetImages;
    try {
      [questionPaperImages, answerSheetImages] = await Promise.all([
        fileToPageImages(qBuf, questionPaper.type),
        fileToPageImages(aBuf, answerSheet.type),
      ]);
    } catch (err) {
      console.error("file conversion error", err);
      await updateSession(id, { stage: "error", error: "Could not read one of the files. It may be corrupted or password-protected." });
      return NextResponse.json({ error: "Failed to process uploaded files. They may be corrupted or password-protected." }, { status: 422 });
    }

    if (questionPaperImages.length === 0 || answerSheetImages.length === 0) {
      await updateSession(id, { stage: "error", error: "No pages could be read from one of the files." });
      return NextResponse.json({ error: "No pages could be read from one of the files." }, { status: 422 });
    }

    // Extraction needs the raw image data (sent to Gemini) right away, so we
    // keep questionPaperImages/answerSheetImages in-memory for this request
    // and hand them to the extract-questions/extract-answers routes via
    // Blob storage — those routes re-fetch bytes from Blob rather than
    // relying on this request's memory, since a later request may land on a
    // different serverless instance.
    let questionPaperImageRefs, answerSheetImageRefs;
    try {
      [questionPaperImageRefs, answerSheetImageRefs] = await Promise.all([
        storePages(id, "question-paper", questionPaperImages),
        storePages(id, "answer-sheet", answerSheetImages),
      ]);
    } catch (err) {
      console.error("blob upload error", err);
      await updateSession(id, { stage: "error", error: "Failed to store uploaded pages." });
      return NextResponse.json({ error: "Failed to store uploaded pages. Please try again." }, { status: 502 });
    }

    const session = await updateSession(id, {
      stage: "converting",
      questionPaperImageRefs,
      answerSheetImageRefs,
      questionPaperPages: questionPaperImages.map((p) => ({ width: p.width, height: p.height })),
      answerSheetPages: answerSheetImages.map((p) => ({ width: p.width, height: p.height })),
    });

    return NextResponse.json({ sessionId: id, session: toPublic(session!) });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json({ error: "Unexpected server error while uploading." }, { status: 500 });
  }
}
