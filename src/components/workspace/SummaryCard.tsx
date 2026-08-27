import type { OverallFeedback } from "@/types";

export function SummaryCard({ overall }: { overall: OverallFeedback }) {
  const pct = overall.totalMax > 0 ? Math.round((overall.totalScore / overall.totalMax) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white border border-veda-gray-200 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-veda-black">Grading Summary</h3>
        <span className="font-heading font-bold text-2xl text-veda-orange">
          {overall.totalScore}/{overall.totalMax}
          <span className="text-sm text-veda-gray-400 font-medium ml-1.5">({pct}%)</span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Answered" value={overall.answeredCount} className="bg-emerald-50 text-emerald-700" />
        <Stat label="Unanswered" value={overall.unansweredCount} className="bg-veda-gray-100 text-veda-gray-600" />
        <Stat label="Unmatched" value={overall.unmatchedCount} className="bg-amber-50 text-amber-700" />
      </div>

      <p className="text-sm text-veda-gray-600 mt-4 leading-relaxed">{overall.summary}</p>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${className}`}>
      <p className="font-heading font-bold text-lg leading-none">{value}</p>
      <p className="text-[11px] mt-1 opacity-80">{label}</p>
    </div>
  );
}
