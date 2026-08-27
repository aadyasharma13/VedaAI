import { Redis } from "@upstash/redis";
import type { SessionData } from "@/types";

// Session metadata (questions, answers, grades — all small JSON) lives in
// Upstash Redis so it survives across the independent serverless function
// instances a Vercel deployment may route requests to; a plain in-memory Map
// only works within a single long-running process; two separate route
// invocations for the same session are not guaranteed to land on the same
// instance. Page images are NOT stored here — they're uploaded to Vercel
// Blob and only their pathnames are kept in this record (see blob.ts).

const SESSION_TTL_SECONDS = 2 * 60 * 60; // 2 hours

export interface StoredPageRef {
  page: number;
  width: number;
  height: number;
  blobPathname: string;
}

export interface InternalSession extends Omit<SessionData, "questionPaperPages" | "answerSheetPages"> {
  questionPaperPages?: { width: number; height: number }[];
  answerSheetPages?: { width: number; height: number }[];
  questionPaperImageRefs: StoredPageRef[];
  answerSheetImageRefs: StoredPageRef[];
}

function redis() {
  return Redis.fromEnv();
}

function key(id: string) {
  return `session:${id}`;
}

export async function createSession(id: string): Promise<InternalSession> {
  const session: InternalSession = {
    id,
    createdAt: Date.now(),
    stage: "idle",
    questionPaperImageRefs: [],
    answerSheetImageRefs: [],
  };
  await redis().set(key(id), session, { ex: SESSION_TTL_SECONDS });
  return session;
}

export async function getSession(id: string): Promise<InternalSession | undefined> {
  const session = await redis().get<InternalSession>(key(id));
  return session ?? undefined;
}

export async function updateSession(id: string, patch: Partial<InternalSession>): Promise<InternalSession | undefined> {
  const existing = await getSession(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch };
  // Refresh TTL on every write so an active session doesn't expire mid-flow.
  await redis().set(key(id), updated, { ex: SESSION_TTL_SECONDS });
  return updated;
}

/** Strips internal blob refs before sending session state to the client. */
export function toPublic(session: InternalSession): SessionData {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude from the public shape
  const { questionPaperImageRefs, answerSheetImageRefs, ...pub } = session;
  return pub;
}
