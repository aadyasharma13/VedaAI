// Core domain types shared across the app.

/** A single page rendered to a PNG data URL, with its pixel dimensions. */
export interface PageImage {
  page: number; // 1-indexed
  dataUrl: string; // "data:image/png;base64,..."
  width: number;
  height: number;
}

/** A normalized bounding box on one page. Coordinates are fractions [0,1] of page width/height. */
export interface BBox {
  page: number; // 1-indexed, refers to the answer sheet's page list
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One question or labelled sub-part, extracted from the question paper in printed order. */
export interface Question {
  id: string; // stable id, e.g. "q-11-a"
  displayNumber: string; // exactly as printed, e.g. "11 (a)"
  baseNumber: string; // grouping key, e.g. "11"
  subpart: string | null; // "a", "b", ... or null
  text: string;
  maxMarks: number | null; // if printed on the paper, else null
  page: number; // page in the question paper this was found on
  order: number; // 0-indexed printed order, for stable sorting
}

export type AnswerStatus = "answered" | "unanswered" | "unmatched";

/** The mapped answer region(s) for one question, or an orphan answer with no question match. */
export interface AnswerMapping {
  id: string;
  questionId: string | null; // null for unmatched answers
  matchedDisplayNumber: string | null; // what the model thinks this answers, even if we couldn't resolve a questionId
  status: AnswerStatus;
  regions: BBox[]; // one or more regions, possibly spanning multiple pages
  transcribedText: string; // best-effort transcription of the handwriting
  confidence: number; // 0-1
}

export interface GradeResult {
  questionId: string;
  score: number;
  maxScore: number;
  verdict: "correct" | "partial" | "incorrect" | "not_attempted" | "ungraded";
  feedback: string;
}

export interface OverallFeedback {
  totalScore: number;
  totalMax: number;
  answeredCount: number;
  unansweredCount: number;
  unmatchedCount: number;
  summary: string;
}

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "converting"
  | "extracting_questions"
  | "extracting_answers"
  | "grading"
  | "done"
  | "error";

export interface SessionData {
  id: string;
  createdAt: number;
  stage: ProcessingStage;
  error?: string;
  questionPaperPages?: { width: number; height: number }[];
  answerSheetPages?: { width: number; height: number }[];
  questions?: Question[];
  answers?: AnswerMapping[];
  grades?: GradeResult[];
  overall?: OverallFeedback;
}

/** Public shape returned to the client — never includes raw image buffers. */
export type SessionPublic = SessionData;
