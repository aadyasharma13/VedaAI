# VedaAI — AI Assessment Extraction & Answer Mapping

A teacher uploads a question paper and one student's handwritten answer sheet. The app extracts every question (preserving printed numbering and treating labelled sub-parts like `11 (a)`/`11 (b)` as separate entries), extracts and maps every answer on the sheet to its question, grades each answer, and lets the teacher click any question to see the **exact region of the answer sheet highlighted** — including answers that span multiple pages.

## Live demo

- **App:** _add your deployed Vercel URL here_
- **Repo:** _add your GitHub URL here_

## Approach

**Pipeline:** Upload → Convert to page images → Extract questions → Extract & map answers → Grade

1. **Upload & normalize** — both files (PDF or image) are accepted. PDFs are rendered server-side to PNG pages (`pdfjs-dist` + `@napi-rs/canvas`) so the rest of the pipeline treats every input uniformly as images — this matters because exact-region highlighting only works cleanly against rendered pixels, not a PDF's (often absent, for a handwritten sheet) text layer.
2. **Question extraction** — every question-paper page image is sent to Gemini in one call with a strict JSON schema, instructed to preserve exact printed numbering, split labelled sub-parts into separate entries, and record printed order.
3. **Answer extraction & mapping** — every answer-sheet page plus the extracted question list is sent to Gemini, which segments the sheet into answer regions and maps each to a question by id, returning a normalized (0–1) bounding box per page for each region. Multi-page answers return multiple region entries. Any answer that can't be confidently matched is returned as `unmatched` rather than forced onto the nearest question.
4. **Reconciliation** — any question with zero matched answers is synthesized as `unanswered` server-side, so the UI always has one uniform list covering answered / unanswered / unmatched.
5. **Grading** — question + transcribed-answer pairs are sent to Gemini for per-question scoring, verdict (correct/partial/incorrect/not attempted), and short feedback, plus one overall summary for the teacher.

All state is in-memory (no database, per the assignment's constraints), keyed by an upload session id; page images are served back to the client via a dedicated route rather than embedded as base64 in JSON, and never leave the server in bulk.

## AI model/API used

**Google Gemini** (`gemini-3.6-flash`), via `@google/genai`. Chosen for its genuinely free tier (no billing setup required) and strong native vision understanding for both printed text and handwriting.

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · `@google/genai` · `pdfjs-dist` + `@napi-rs/canvas` for server-side PDF rendering.

## Running locally

```bash
npm install
cp .env.example .env.local   # then add a free key from https://aistudio.google.com/apikey
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Assumptions & limitations

- **Single answer sheet per upload**, as specified in the assignment (not a batch of students).
- **In-memory storage only** — state is lost on server restart and does not survive across multiple serverless instances; acceptable for this assignment's scope, not production-grade.
- **PDF page cap** — very large PDFs are capped at 12 pages per file to bound processing time and free-tier token usage.
- **Free-tier rate limits** — Gemini's free tier caps requests per day/minute; heavy back-to-back testing can hit `429` errors. The app surfaces this as a clear error rather than failing silently, but repeated grading of many sheets in a short window on a single API key will eventually be rate-limited.
- **Bounding-box precision** is model-dependent — the vision model's region boxes are generally tight but not pixel-perfect; they were validated to be visually correct across handwriting styles (clean, messy, faint pencil, off-ruled-line drift, mixed ink colors) but are an AI estimate, not an OCR-guaranteed coordinate.
- **No authentication/database**, per the assignment's constraints.
