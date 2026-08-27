// Pre-built test files bundled with the app so a grader/teacher can try the
// full pipeline without sourcing their own question paper and handwritten
// answer sheet. All variants share the same question paper; only the answer
// sheet changes, each engineered to stress a different real-world
// handwriting/formatting failure mode.

export interface SampleVariant {
  id: string;
  label: string;
  description: string;
  answerSheetUrl: string;
}

export const QUESTION_PAPER_SAMPLE_URL = "/samples/question-paper.pdf";

export const SAMPLE_VARIANTS: SampleVariant[] = [
  {
    id: "clean",
    label: "Clean baseline",
    description: "In-order answers, one skipped question, one multi-page answer, one unlabeled scribble",
    answerSheetUrl: "/samples/answer-sheet.pdf",
  },
  {
    id: "messy",
    label: "Messy handwriting",
    description: "Deliberately scrawly, rushed handwriting",
    answerSheetUrl: "/samples/answer-sheet-messy.pdf",
  },
  {
    id: "offline",
    label: "Off-ruled-line text",
    description: "Writing drifts and rotates away from the printed ruling",
    answerSheetUrl: "/samples/answer-sheet-offline.pdf",
  },
  {
    id: "mixed-ink",
    label: "Mixed ink & faint pencil",
    description: "Inconsistent pen color/weight, including genuinely faint pencil-gray text",
    answerSheetUrl: "/samples/answer-sheet-mixed-ink.pdf",
  },
  {
    id: "no-labels",
    label: "No question labels",
    description: "No \"Ans N.\" markers at all — answers in order, unlabeled",
    answerSheetUrl: "/samples/answer-sheet-no-labels.pdf",
  },
  {
    id: "numbering-chaos",
    label: "Numbering chaos",
    description: "Wrong, duplicated, and self-corrected question numbers",
    answerSheetUrl: "/samples/answer-sheet-numbering-chaos.pdf",
  },
  {
    id: "edited-mess",
    label: "Heavy edits & smudges",
    description: "Cross-outs, insertion carets, margin notes, and smudge marks",
    answerSheetUrl: "/samples/answer-sheet-edited-mess.pdf",
  },
];

/** Fetches a bundled sample PDF as a File, suitable for feeding into the same upload flow as a manual selection. */
export async function fetchSampleFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load sample file: ${url}`);
  const blob = await res.blob();
  return new File([blob], filename, { type: "application/pdf" });
}
