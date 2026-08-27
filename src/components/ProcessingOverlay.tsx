import { SparkleBurst } from "./SparkleBurst";
import type { ProcessingStage } from "@/types";

// Matches the Figma "Loading state" / "AnalysingLoader" screens: a single
// centered animated sparkle burst with a bold status word and a short
// subtext, rather than a multi-step checklist.
const STAGE_COPY: Partial<Record<ProcessingStage, { title: string; subtitle: string }>> = {
  converting: { title: "Reading files...", subtitle: "This may take a while" },
  extracting_questions: { title: "Extracting...", subtitle: "This may take a while" },
  extracting_answers: { title: "Mapping answers...", subtitle: "This may take a while" },
  grading: { title: "Grading...", subtitle: "This may take a while" },
};

export function ProcessingOverlay({ stage, error }: { stage: ProcessingStage; error?: string }) {
  const copy = STAGE_COPY[stage] ?? STAGE_COPY.extracting_questions!;

  return (
    <div className="flex flex-col items-center justify-center gap-1 pt-24">
      <SparkleBurst size={110} animate={!error} />
      {error ? (
        <>
          <h2 className="font-heading font-bold text-2xl text-veda-black mt-2">Something went wrong</h2>
          <p className="text-veda-gray-500 mt-1 max-w-sm text-center">{error}</p>
        </>
      ) : (
        <>
          <h2 className="font-heading font-bold text-2xl text-veda-black mt-2">{copy.title}</h2>
          <p className="text-veda-gray-500 mt-1">{copy.subtitle}</p>
        </>
      )}
    </div>
  );
}
