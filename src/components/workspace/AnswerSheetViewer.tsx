"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { BBox } from "@/types";
import { pageImageUrl } from "@/lib/api";

export type HighlightVerdict = "correct" | "partial" | "incorrect" | "neutral";

export interface ActiveHighlight {
  label: string;
  verdict: HighlightVerdict;
  regions: BBox[];
}

const VERDICT_COLORS: Record<HighlightVerdict, { border: string; bg: string; tabBg: string }> = {
  correct: { border: "border-emerald-500", bg: "bg-emerald-500/10", tabBg: "bg-emerald-500" },
  partial: { border: "border-amber-500", bg: "bg-amber-500/10", tabBg: "bg-amber-500" },
  incorrect: { border: "border-red-500", bg: "bg-red-500/10", tabBg: "bg-red-500" },
  neutral: { border: "border-veda-orange", bg: "bg-veda-orange/10", tabBg: "bg-veda-orange" },
};

export function AnswerSheetViewer({
  sessionId,
  pageCount,
  activeHighlight,
  unmatchedRegionsByPage,
}: {
  sessionId: string;
  pageCount: number;
  activeHighlight: ActiveHighlight | null;
  /** Faint markers for unmatched answers, shown on every page regardless of selection. */
  unmatchedRegionsByPage: Map<number, BBox[]>;
}) {
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  // Single source of truth for the displayed page number. Updated either by
  // manual prev/next clicks, or synced below (during render, React's
  // recommended pattern for "adjusting state when a prop changes") whenever
  // a new highlight jumps the view to a different page.
  const [currentPage, setCurrentPage] = useState(1);
  const [prevHighlightPage, setPrevHighlightPage] = useState<number | null>(null);

  const activeRegions = activeHighlight?.regions ?? [];
  const highlightPage = activeRegions.length > 0 ? Math.min(...activeRegions.map((r) => r.page)) : null;

  if (highlightPage != null && highlightPage !== prevHighlightPage) {
    setPrevHighlightPage(highlightPage);
    setCurrentPage(highlightPage);
  }

  useEffect(() => {
    if (highlightPage == null) return;
    const el = pageRefs.current.get(highlightPage);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlightPage]);

  const pages = useMemo(() => Array.from({ length: pageCount }, (_, i) => i + 1), [pageCount]);

  function goToPage(p: number) {
    const clamped = Math.max(1, Math.min(pageCount, p));
    setCurrentPage(clamped);
    pageRefs.current.get(clamped)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1a1a] text-white shrink-0">
        <span className="font-heading font-bold text-sm">Answer Sheet</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Zoom out"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Zoom in"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-medium whitespace-nowrap px-1">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
              disabled={currentPage >= pageCount}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-6 py-6 px-4 bg-veda-gray-50">
        <div style={{ width: `${zoom}%`, maxWidth: `${zoom * 7.6}px` }} className="flex flex-col items-center gap-6">
          {pages.map((page) => {
            const pageActiveRegions = activeRegions.filter((r) => r.page === page);
            return (
              <div
                key={page}
                ref={(el) => {
                  if (el) pageRefs.current.set(page, el);
                  else pageRefs.current.delete(page);
                }}
                className="relative w-full shadow-sm rounded-xl overflow-hidden bg-white ring-1 ring-veda-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pageImageUrl(sessionId, "answer-sheet", page)}
                  alt={`Answer sheet page ${page}`}
                  className="w-full h-auto block select-none"
                  draggable={false}
                />

                {(unmatchedRegionsByPage.get(page) ?? []).map((box, i) => (
                  <div
                    key={`unmatched-${page}-${i}`}
                    className="absolute border-2 border-dashed border-veda-gray-400/70 bg-veda-gray-400/10 rounded-sm pointer-events-none"
                    style={boxStyle(box)}
                    title="Unmatched answer"
                  />
                ))}

                {activeHighlight &&
                  pageActiveRegions.map((box, i) => {
                    const colors = VERDICT_COLORS[activeHighlight.verdict];
                    return (
                      <div key={`active-${page}-${i}`} className="absolute" style={boxStyle(box)}>
                        <div className={`absolute -top-6 left-0 ${colors.tabBg} text-white text-[11px] font-heading font-bold px-2 py-0.5 rounded-t-md`}>
                          {activeHighlight.label}
                        </div>
                        <div className={`w-full h-full border-2 ${colors.border} ${colors.bg} rounded-sm`} />
                      </div>
                    );
                  })}

                <div className="absolute bottom-2 right-2 text-[11px] bg-black/60 text-white rounded-full px-2 py-0.5">
                  Page {page}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function boxStyle(box: BBox): React.CSSProperties {
  return {
    left: `${box.x * 100}%`,
    top: `${box.y * 100}%`,
    width: `${box.w * 100}%`,
    height: `${box.h * 100}%`,
  };
}
