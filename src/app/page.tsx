"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TeacherOrb } from "@/components/TeacherOrb";
import { UploadCard } from "@/components/UploadCard";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { uploadFiles, extractQuestionsStep, extractAnswersStep, gradeStep } from "@/lib/api";
import type { ProcessingStage } from "@/types";

export default function UploadPage() {
  const router = useRouter();
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [error, setError] = useState<string | undefined>();

  const canStart = !!questionPaper && !!answerSheet && stage === "idle";
  const isProcessing = stage !== "idle" && stage !== "error";

  async function handleStartMapping() {
    if (!questionPaper || !answerSheet) return;
    setError(undefined);
    try {
      setStage("converting");
      const { sessionId } = await uploadFiles(questionPaper, answerSheet);

      setStage("extracting_questions");
      await extractQuestionsStep(sessionId);

      setStage("extracting_answers");
      await extractAnswersStep(sessionId);

      setStage("grading");
      await gradeStep(sessionId);

      setStage("done");
      router.push(`/workspace/${sessionId}`);
    } catch (err) {
      setStage("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <AppShell breadcrumb="Exams">
      <div className="px-8 py-12">
        {!isProcessing && stage !== "error" ? (
          <>
            <div className="text-center">
              <h1 className="heading-display text-veda-black inline">
                Upload{" "}
              </h1>
              <span className="heading-display text-veda-orange bg-veda-orange-light px-3 py-1 rounded-xl">
                <span className="underline decoration-2 underline-offset-4">Q</span>uestion Paper &amp; Answer Sheets
              </span>
              <p className="text-veda-gray-500 mt-3 text-[15px]">Upload both files to get started</p>
            </div>

            <TeacherOrb />

            <div className="mt-10 max-w-3xl mx-auto flex gap-5">
              <UploadCard label="Upload" highlight="Question Paper" file={questionPaper} onChange={setQuestionPaper} />
              <UploadCard label="Upload" highlight="Answer Sheet" file={answerSheet} onChange={setAnswerSheet} />
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={!canStart}
                onClick={handleStartMapping}
                className={`rounded-full px-7 py-3 font-heading font-semibold text-sm flex items-center gap-2 transition-colors ${
                  canStart ? "bg-veda-black text-white hover:bg-veda-black/90" : "bg-veda-gray-200 text-veda-gray-400 cursor-not-allowed"
                }`}
              >
                Start Mapping <ArrowRight size={16} />
              </button>
              <p className="text-xs text-veda-gray-400">Once both files are uploaded, you&apos;ll able to map answers with questions</p>
            </div>
          </>
        ) : stage === "error" ? (
          <div className="mx-auto text-center">
            <ProcessingOverlay stage={stage} error={error} />
            <button
              type="button"
              onClick={() => setStage("idle")}
              className="mt-6 rounded-full px-6 py-2.5 bg-veda-black text-white font-heading font-semibold text-sm"
            >
              Try again
            </button>
          </div>
        ) : (
          <ProcessingOverlay stage={stage} />
        )}
      </div>
    </AppShell>
  );
}
