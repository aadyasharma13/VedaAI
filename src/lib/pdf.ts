import type { PageImage } from "@/types";

// Server-side PDF rendering using pdfjs-dist's legacy Node build + @napi-rs/canvas.
// We render every page to a PNG so the rest of the pipeline (AI extraction,
// bounding-box highlighting) only ever deals with images — a PDF's text layer
// (if any) is unreliable for handwritten answer sheets anyway, and treating
// everything as images keeps question-paper and answer-sheet handling uniform.

const MAX_PAGES = 12; // guard against pathologically large uploads
const RENDER_SCALE = 2.0; // ~144dpi at typical A4/Letter sizes, good OCR balance

export async function fileToPageImages(buffer: Buffer, mimeType: string): Promise<PageImage[]> {
  if (mimeType === "application/pdf") {
    return renderPdfToImages(buffer);
  }
  if (mimeType.startsWith("image/")) {
    const dims = await getImageDimensions(buffer, mimeType);
    return [
      {
        page: 1,
        dataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
        width: dims.width,
        height: dims.height,
      },
    ];
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function renderPdfToImages(buffer: Buffer): Promise<PageImage[]> {
  const { createCanvas } = await import("@napi-rs/canvas");
  // Legacy build works in Node without a DOM/worker.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
  });
  const doc = await loadingTask.promise;
  const pageCount = Math.min(doc.numPages, MAX_PAGES);
  const images: PageImage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext("2d");

    // pdfjs expects a CanvasRenderingContext2D-like object; @napi-rs/canvas's
    // context is API-compatible for the drawing operations pdfjs uses.
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

    const pngBuffer = canvas.toBuffer("image/png");
    images.push({
      page: i,
      dataUrl: `data:image/png;base64,${pngBuffer.toString("base64")}`,
      width: canvas.width,
      height: canvas.height,
    });
  }

  return images;
}

async function getImageDimensions(buffer: Buffer, mimeType: string): Promise<{ width: number; height: number }> {
  const { loadImage } = await import("@napi-rs/canvas");
  void mimeType;
  const img = await loadImage(buffer);
  return { width: img.width, height: img.height };
}
