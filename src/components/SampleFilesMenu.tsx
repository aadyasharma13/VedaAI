"use client";

import { useEffect, useRef, useState } from "react";
import { FlaskConical, ChevronDown, Loader2 } from "lucide-react";
import { SAMPLE_VARIANTS, type SampleVariant } from "@/lib/samples";

export function SampleFilesMenu({
  onSelect,
  loadingId,
}: {
  onSelect: (variant: SampleVariant) => void;
  loadingId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-veda-gray-200 bg-white px-5 py-2.5 font-heading font-semibold text-sm text-veda-black flex items-center gap-2 hover:border-veda-gray-400 transition-colors"
      >
        <FlaskConical size={15} className="text-veda-orange" />
        Try Sample Files
        <ChevronDown size={14} className={`text-veda-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-80 rounded-2xl border border-veda-gray-200 bg-white shadow-lg p-2 left-1/2 -translate-x-1/2">
          <p className="px-3 py-2 text-xs text-veda-gray-400">
            Same question paper, different handwriting/formatting challenges
          </p>
          <div className="flex flex-col gap-0.5 max-h-80 overflow-y-auto">
            {SAMPLE_VARIANTS.map((variant) => {
              const isLoading = loadingId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={loadingId !== null}
                  onClick={() => {
                    onSelect(variant);
                    setOpen(false);
                  }}
                  className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-veda-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold text-sm text-veda-black">{variant.label}</p>
                    <p className="text-xs text-veda-gray-500 mt-0.5 leading-snug">{variant.description}</p>
                  </div>
                  {isLoading && <Loader2 size={14} className="text-veda-orange animate-spin shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
