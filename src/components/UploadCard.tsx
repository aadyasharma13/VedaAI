"use client";

import { useRef, useState } from "react";
import { Upload, FileCheck2, X } from "lucide-react";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";
const MAX_SIZE = 10 * 1024 * 1024;

export function UploadCard({
  label,
  highlight,
  file,
  onChange,
}: {
  label: string;
  highlight: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateAndSet(f: File | undefined | null) {
    if (!f) return;
    setError(null);
    if (f.size > MAX_SIZE) {
      setError("File exceeds 10MB limit.");
      return;
    }
    const okType = /\.(pdf|png|jpe?g|webp)$/i.test(f.name);
    if (!okType) {
      setError("Unsupported file type.");
      return;
    }
    onChange(f);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        validateAndSet(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex-1 min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 px-6 py-10 cursor-pointer transition-colors bg-white ${
        isDragOver ? "border-veda-orange bg-veda-orange-light/40" : "border-veda-gray-200 hover:border-veda-gray-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />

      {file ? (
        <>
          <div className="w-11 h-11 rounded-xl bg-veda-orange-light flex items-center justify-center">
            <FileCheck2 size={20} className="text-veda-orange" />
          </div>
          <div className="text-center max-w-full px-4">
            <p className="font-heading font-semibold text-veda-black truncate max-w-[240px]">{file.name}</p>
            <p className="text-xs text-veda-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
              setError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="mt-1 flex items-center gap-1 text-xs text-veda-gray-500 hover:text-veda-orange"
          >
            <X size={13} /> Remove
          </button>
        </>
      ) : (
        <>
          <div className="w-11 h-11 rounded-xl bg-veda-gray-100 flex items-center justify-center">
            <Upload size={20} className="text-veda-black" />
          </div>
          <p className="font-heading font-semibold text-veda-black text-[15px]">
            {label} <span className="text-veda-orange underline underline-offset-2">{highlight}</span>
          </p>
          <p className="text-xs text-veda-gray-400">Max 10MB</p>
        </>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
