import { put, get } from "@vercel/blob";
import type { PageImage } from "@/types";
import type { StoredPageRef } from "@/lib/store";

// Page images (rendered PDF pages / uploaded images) live in Vercel Blob
// rather than in the Redis session record — they can be several MB per page
// and Redis/KV stores are the wrong place for large binary blobs. Session
// JSON only ever stores the resulting blob pathname.

export async function uploadPageImage(sessionId: string, kind: "question-paper" | "answer-sheet", page: number, dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  const [, mimeType, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  const ext = mimeType.split("/")[1] ?? "png";
  const pathname = `sessions/${sessionId}/${kind}/${page}.${ext}`;

  // Private access: these are student answer sheets, not content that
  // should be reachable via a guessable/public URL. The client only ever
  // reaches page images through our own authenticated proxy route.
  const blob = await put(pathname, buffer, {
    access: "private",
    contentType: mimeType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return blob.pathname;
}

export async function readPageImage(pathname: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  const chunks: Uint8Array[] = [];
  const reader = result.stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return { buffer: Buffer.concat(chunks), contentType: result.blob.contentType };
}

/** Re-hydrates stored page refs back into PageImage[] (with base64 dataUrls) for AI calls. */
export async function refsToPageImages(refs: StoredPageRef[]): Promise<PageImage[]> {
  const images = await Promise.all(
    refs.map(async (ref) => {
      const file = await readPageImage(ref.blobPathname);
      if (!file) throw new Error(`Page image not found in blob storage: ${ref.blobPathname}`);
      return {
        page: ref.page,
        width: ref.width,
        height: ref.height,
        dataUrl: `data:${file.contentType};base64,${file.buffer.toString("base64")}`,
      };
    }),
  );
  return images.sort((a, b) => a.page - b.page);
}
