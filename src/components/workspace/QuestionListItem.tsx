import { ChevronDown, ChevronUp } from "lucide-react";
import type { Question, AnswerMapping, GradeResult } from "@/types";

const VERDICT_PILL: Record<string, string> = {
  correct: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  incorrect: "bg-red-100 text-red-600",
  not_attempted: "bg-veda-gray-100 text-veda-gray-500",
  ungraded: "bg-veda-gray-100 text-veda-gray-500",
};

const VERDICT_RING: Record<string, string> = {
  correct: "border-emerald-400 bg-emerald-50/40",
  partial: "border-amber-400 bg-amber-50/40",
  incorrect: "border-red-400 bg-red-50/40",
  not_attempted: "border-veda-gray-200 bg-white",
  ungraded: "border-veda-gray-200 bg-white",
};

export function QuestionListItem({
  index,
  question,
  answer,
  grade,
  isActive,
  isExpanded,
  onClick,
  onToggleExpand,
}: {
  index: number;
  question: Question;
  answer: AnswerMapping | undefined;
  grade: GradeResult | undefined;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onToggleExpand: () => void;
}) {
  const isAnswered = answer && answer.status === "answered";
  const pageSpan = answer ? new Set(answer.regions.map((r) => r.page)).size : 0;
  const verdict = grade?.verdict ?? "ungraded";
  const ringClass = isActive ? VERDICT_RING[verdict] : "border-veda-gray-200 bg-white hover:border-veda-gray-400";

  return (
    <div className={`rounded-2xl border transition-colors ${ringClass}`}>
      <button type="button" onClick={onClick} className="w-full text-left p-4 flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-veda-black text-white font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
          {question.subpart ? question.baseNumber : index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {question.subpart && (
                <span className="font-heading font-bold text-veda-black text-xs bg-veda-gray-100 rounded-full px-2 py-0.5">
                  {question.subpart}
                </span>
              )}
              {!isAnswered && (
                <span className="text-[11px] font-medium text-veda-gray-500 bg-veda-gray-100 rounded-full px-2 py-0.5">
                  Unanswered
                </span>
              )}
              {isAnswered && pageSpan > 1 && (
                <span className="text-[11px] font-medium text-veda-orange bg-veda-orange-light rounded-full px-2 py-0.5">
                  {pageSpan} pages
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {grade && (
                <span className={`text-xs font-heading font-bold rounded-full px-2.5 py-1 ${VERDICT_PILL[verdict]}`}>
                  {grade.score}/{grade.maxScore}
                </span>
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onToggleExpand();
                  }
                }}
                className="text-veda-gray-400 hover:text-veda-black"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>
          </div>

          <p className="text-sm text-veda-black mt-1.5 leading-snug">{question.text}</p>
        </div>
      </button>

      {isExpanded && grade && (
        <div className="mx-4 mb-4 rounded-xl bg-veda-gray-50 p-4">
          <p className="font-heading font-bold text-sm text-veda-black mb-1">AI Feedback</p>
          <p className="text-sm text-veda-gray-600 leading-relaxed">{grade.feedback}</p>
        </div>
      )}
    </div>
  );
}
