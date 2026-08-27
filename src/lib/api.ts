import type { SessionData } from "@/types";

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? `Request failed with ${res.status}`);
  return body;
}

export async function uploadFiles(questionPaper: File, answerSheet: File) {
  const form = new FormData();
  form.append("questionPaper", questionPaper);
  form.append("answerSheet", answerSheet);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  return json<{ sessionId: string; session: SessionData }>(res);
}

export async function extractQuestionsStep(sessionId: string) {
  const res = await fetch("/api/extract-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  return json<{ session: SessionData }>(res);
}

export async function extractAnswersStep(sessionId: string) {
  const res = await fetch("/api/extract-answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  return json<{ session: SessionData }>(res);
}

export async function gradeStep(sessionId: string) {
  const res = await fetch("/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  return json<{ session: SessionData }>(res);
}

export async function getSessionState(sessionId: string) {
  const res = await fetch(`/api/session/${sessionId}`);
  return json<{ session: SessionData }>(res);
}

export function pageImageUrl(sessionId: string, kind: "question-paper" | "answer-sheet", page: number) {
  return `/api/session/${sessionId}/pages/${kind}/${page}`;
}
