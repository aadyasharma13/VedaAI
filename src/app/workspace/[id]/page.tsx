"use client";

import { use, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { QuestionListItem } from "@/components/workspace/QuestionListItem";
import { AnswerSheetViewer, type ActiveHighlight, type HighlightVerdict } from "@/components/workspace/AnswerSheetViewer";
import { SummaryCard } from "@/components/workspace/SummaryCard";
import { UnmatchedPanel } from "@/components/workspace/UnmatchedPanel";
import { getSessionState } from "@/lib/api";
import type { AnswerMapping, BBox, GradeResult, SessionData } from "@/types";

const VERDICT_TO_HIGHLIGHT: Record<string, HighlightVerdict> = {
  correct: "correct",
  partial: "partial",
  incorrect: "incorrect",
  not_attempted: "neutral",
  ungraded: "neutral",
};

export default function WorkspacePage({ params }: PageProps<"/workspace/[id]">) {
  const { id: sessionId } = use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeUnmatchedId, setActiveUnmatchedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    getSessionState(sessionId)
      .then(({ session }) => {
        setSession(session);
        const first = session.questions?.[0];
        if (first) setActiveQuestionId(first.id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load session."));
  }, [sessionId]);

  const answersByQuestionId = useMemo(() => {
    const map = new Map<string, AnswerMapping[]>();
    if (!session?.answers) return map;
    for (const a of session.answers) {
      if (!a.questionId) continue;
      const list = map.get(a.questionId) ?? [];
      list.push(a);
      map.set(a.questionId, list);
    }
    return map;
  }, [session]);

  const gradesByQuestionId = useMemo(() => {
    const map = new Map<string, GradeResult>();
    session?.grades?.forEach((g) => map.set(g.questionId, g));
    return map;
  }, [session]);

  const unmatchedAnswers = useMemo(() => session?.answers?.filter((a) => a.status === "unmatched") ?? [], [session]);

  const unmatchedRegionsByPage = useMemo(() => {
    const map = new Map<number, BBox[]>();
    for (const a of unmatchedAnswers) {
      for (const r of a.regions) {
        const list = map.get(r.page) ?? [];
        list.push(r);
        map.set(r.page, list);
      }
    }
    return map;
  }, [unmatchedAnswers]);

  const activeHighlight: ActiveHighlight | null = useMemo(() => {
    if (activeUnmatchedId) {
      const a = unmatchedAnswers.find((u) => u.id === activeUnmatchedId);
      if (!a) return null;
      return { label: "Unmatched", verdict: "neutral", regions: a.regions };
    }
    if (!activeQuestionId || !session?.questions) return null;
    const question = session.questions.find((q) => q.id === activeQuestionId);
    if (!question) return null;
    const answers = answersByQuestionId.get(activeQuestionId) ?? [];
    const grade = gradesByQuestionId.get(activeQuestionId);
    const verdict = VERDICT_TO_HIGHLIGHT[grade?.verdict ?? "ungraded"];
    return {
      label: `Q${question.displayNumber}`,
      verdict,
      regions: answers.flatMap((a) => a.regions),
    };
  }, [activeQuestionId, activeUnmatchedId, answersByQuestionId, gradesByQuestionId, unmatchedAnswers, session]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpandAll() {
    if (!session?.questions) return;
    if (allExpanded) {
      setExpandedIds(new Set());
      setAllExpanded(false);
    } else {
      setExpandedIds(new Set(session.questions.map((q) => q.id)));
      setAllExpanded(true);
    }
  }

  if (error) {
    return (
      <AppShell breadcrumb="Exams">
        <div className="max-w-md mx-auto mt-24 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </AppShell>
    );
  }

  if (!session || !session.questions || !session.answers) {
    return (
      <AppShell breadcrumb="Exams">
        <div className="max-w-md mx-auto mt-24 text-center text-veda-gray-500">Loading…</div>
      </AppShell>
    );
  }

  const pageCount = session.answerSheetPages?.length ?? 0;

  return (
    <AppShell breadcrumb="Exams">
      <div className="h-full flex">
        {/* Left: question list */}
        <div className="w-[440px] shrink-0 border-r border-veda-gray-200 h-full overflow-y-auto p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-bold text-lg text-veda-black">
              Extracted <span className="underline decoration-2 underline-offset-2 decoration-veda-orange">Q</span>uestions{" "}
              <span className="text-veda-gray-400 font-medium text-sm">(from question paper)</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={toggleExpandAll}
            className="self-start rounded-full border border-veda-gray-200 px-4 py-1.5 text-xs font-heading font-semibold text-veda-black hover:bg-veda-gray-50 -mt-2"
          >
            {allExpanded ? "Collapse All" : "Expand All"}
          </button>

          {session.overall && <SummaryCard overall={session.overall} />}

          <div className="flex flex-col gap-3">
            {session.questions.map((q, i) => {
              const answers = answersByQuestionId.get(q.id) ?? [];
              const answer = answers[0];
              const grade = gradesByQuestionId.get(q.id);
              return (
                <QuestionListItem
                  key={q.id}
                  index={i}
                  question={q}
                  answer={answer}
                  grade={grade}
                  isActive={activeQuestionId === q.id && !activeUnmatchedId}
                  isExpanded={expandedIds.has(q.id)}
                  onClick={() => {
                    setActiveQuestionId(q.id);
                    setActiveUnmatchedId(null);
                  }}
                  onToggleExpand={() => toggleExpand(q.id)}
                />
              );
            })}
          </div>

          <UnmatchedPanel
            unmatched={unmatchedAnswers}
            activeId={activeUnmatchedId}
            onSelect={(id) => {
              setActiveUnmatchedId(id);
              setActiveQuestionId(null);
            }}
          />
        </div>

        {/* Right: answer sheet with highlight */}
        <div className="flex-1 min-w-0 h-full">
          <AnswerSheetViewer
            sessionId={sessionId}
            pageCount={pageCount}
            activeHighlight={activeHighlight}
            unmatchedRegionsByPage={unmatchedRegionsByPage}
          />
        </div>
      </div>
    </AppShell>
  );
}
