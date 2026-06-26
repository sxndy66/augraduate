"use client";

import { useState, useRef, useCallback } from "react";
import { parseOCRText, type ParsedSubject } from "@/lib/ocr/parser";


interface OCRUploaderProps {
  onParsed: (subjects: ParsedSubject[]) => void;
}

type ScanState = "idle" | "loading" | "scanning" | "done" | "error";

export function OCRUploader({ onParsed }: OCRUploaderProps) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const runOCR = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Only image files are supported (PNG, JPG, WEBP).");
      setScanState("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File too large. Max 10 MB.");
      setScanState("error");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setScanState("scanning");
    setProgress(0);
    setErrorMsg(null);

    try {
      // Dynamic import — keeps bundle size small
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round((m.progress ?? 0) * 100));
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const parsed = parseOCRText(data.text);

      if (parsed.length === 0) {
        setErrorMsg(
          "No subjects detected. Make sure the screenshot shows subject codes (e.g. CS3401) and grades (O, A+, A…)."
        );
        setScanState("error");
        return;
      }

      setScanState("done");
      onParsed(parsed);
    } catch (err) {
      console.error("OCR error:", err);
      setErrorMsg("Scan failed. Try a clearer screenshot or enter grades manually.");
      setScanState("error");
    }
  }, [onParsed]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      runOCR(file);
    },
    [runOCR]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const reset = () => {
    setScanState("idle");
    setProgress(0);
    setPreview(null);
    setErrorMsg(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {scanState === "idle" && (
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-[#2A2A3D] hover:border-[#6C63FF]/60 rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-all duration-200 bg-[#12121A] hover:bg-[#6C63FF]/5 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1A1A26] border border-[#2A2A3D] group-hover:border-[#6C63FF]/40 flex items-center justify-center transition-colors">
            <svg width="24" height="24" fill="none" stroke="#6B6B80" strokeWidth="1.5" viewBox="0 0 24 24" className="group-hover:stroke-[#6C63FF] transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[#E8E8F0] font-medium text-sm">Drop your result screenshot here</p>
            <p className="text-[#6B6B80] text-xs mt-1">or click to browse · PNG, JPG, WEBP · max 10 MB</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {["Subject Code", "Credits", "Grade", "Grade Points"].map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A26] border border-[#2A2A3D] text-[#6B6B80]">
                {tag}
              </span>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Scanning progress */}
      {scanState === "scanning" && (
        <div className="card flex flex-col items-center gap-4 py-10">
          {preview && (
            <img
              src={preview}
              alt="Scanning"
              className="h-32 w-auto rounded-lg border border-[#2A2A3D] object-contain opacity-60"
            />
          )}
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-xs text-[#6B6B80]">
              <span>Scanning result portal…</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#1A1A26] border border-[#2A2A3D] overflow-hidden">
              <div
                className="h-full bg-[#6C63FF] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[#6B6B80] text-xs text-center">
              Detecting subject codes and grades…
            </p>
          </div>
        </div>
      )}

      {/* Done state */}
      {scanState === "done" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-sm">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Scan complete — review subjects below, then confirm to save.
          <button onClick={reset} className="ml-auto text-xs underline opacity-70 hover:opacity-100">
            Rescan
          </button>
        </div>
      )}

      {/* Error state */}
      {scanState === "error" && (
        <div className="card border-[#FF4757]/30 bg-[#FF4757]/5 space-y-3">
          <div className="flex items-start gap-3 text-[#FF4757] text-sm">
            <svg width="16" height="16" fill="currentColor" className="mt-0.5 shrink-0" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={reset}
            className="text-xs text-[#6C63FF] hover:underline"
          >
            ← Try another image
          </button>
        </div>
      )}
    </div>
  );
}
