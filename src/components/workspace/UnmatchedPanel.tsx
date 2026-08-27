import { AlertTriangle } from "lucide-react";
import type { AnswerMapping } from "@/types";

export function UnmatchedPanel({
  unmatched,
  activeId,
  onSelect,
}: {
  unmatched: AnswerMapping[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  if (unmatched.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle size={16} />
        <h3 className="font-heading font-semibold text-sm">Unmatched answers ({unmatched.length})</h3>
      </div>
      <p className="text-xs text-amber-700/80 mt-1">
        These answer regions didn&apos;t confidently match any question on the paper.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {unmatched.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={`text-left rounded-xl border p-2.5 text-xs transition-colors ${
              activeId === a.id ? "border-veda-orange bg-white" : "border-amber-200/80 bg-white/60 hover:bg-white"
            }`}
          >
            <span className="font-medium text-veda-black">
              {a.matchedDisplayNumber ? `Possibly Q${a.matchedDisplayNumber}` : "Unlabeled answer"}
            </span>
            <p className="text-veda-gray-500 line-clamp-2 mt-0.5">{a.transcribedText || "(no transcription)"}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
