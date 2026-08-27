import type { PageImage, SessionData } from "@/types";

// In-memory only, per assignment constraints (no DB). This means state is lost
// on server restart and does not survive across multiple serverless instances —
// acceptable for this assignment's scope (single dev/demo deployment).

interface InternalSession extends SessionData {
  questionPaperImages: PageImage[];
  answerSheetImages: PageImage[];
}

const sessions = new Map<string, InternalSession>();

export function createSession(id: string): InternalSession {
  const session: InternalSession = {
    id,
    createdAt: Date.now(),
    stage: "idle",
    questionPaperImages: [],
    answerSheetImages: [],
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): InternalSession | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, patch: Partial<InternalSession>): InternalSession | undefined {
  const existing = sessions.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch };
  sessions.set(id, updated);
  return updated;
}

/** Strips internal image buffers before sending session state to the client. */
export function toPublic(session: InternalSession): SessionData {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude from the public shape
  const { questionPaperImages, answerSheetImages, ...pub } = session;
  return pub;
}

// Periodically evict sessions older than 2 hours to bound memory growth.
const TWO_HOURS = 2 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > TWO_HOURS) sessions.delete(id);
  }
}, 30 * 60 * 1000).unref?.();
