"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ImageIcon, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const ACCEPTED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onFileCleared?: () => void;
  previewUrl?: string | null;
  disabled?: boolean;
  className?: string;
}

interface ValidationError {
  message: string;
}

function validateFile(file: File): ValidationError | null {
  const extension = "." + (file.name.split(".").pop() || "").toLowerCase();

  if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(extension)) {
    return {
      message: "Only PNG, JPG, JPEG, and WEBP images are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File size exceeds 5 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
    };
  }

  return null;
}

export function UploadZone({
  onFileSelected,
  onFileCleared,
  previewUrl,
  disabled = false,
  className,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError.message);
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounter.current += 1;
      setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounter.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset so selecting the same file again still fires onChange
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [handleFile]
  );

  const handleBrowseClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleClear = useCallback(() => {
    setError(null);
    onFileCleared?.();
  }, [onFileCleared]);

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl border border-navy-600 bg-navy-800/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded grade screenshot preview"
              className="max-h-[400px] w-full object-contain"
            />
            <div className="absolute right-3 top-3 flex gap-2">
              <Button
                size="sm"
                variant="danger"
                onClick={handleClear}
                disabled={disabled}
                leftIcon={<X className="h-4 w-4" />}
              >
                Remove
              </Button>
            </div>
            <div className="flex items-center gap-2 border-t border-navy-600 bg-navy-800/80 px-4 py-2.5">
              <ImageIcon className="h-4 w-4 text-electric-blue" />
              <span className="text-sm text-gray-300">Screenshot uploaded and ready for OCR</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleBrowseClick();
              }
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all duration-200",
              isDragging
                ? "border-electric-blue bg-electric-blue/10 scale-[1.01]"
                : "border-navy-600 bg-navy-800/30 hover:border-electric-blue/50 hover:bg-navy-800/50",
              disabled && "cursor-not-allowed opacity-60"
            )}
          >
            <motion.div
              animate={isDragging ? { y: -4 } : { y: 0 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-electric-blue/10 text-electric-blue"
            >
              <UploadCloud className="h-8 w-8" />
            </motion.div>
            <p className="text-base font-semibold text-white">
              {isDragging ? "Drop your screenshot here" : "Drag & drop your grade screenshot"}
            </p>
            <p className="mt-1.5 text-sm text-gray-400">
              or <span className="text-electric-blue underline">click to browse</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-navy-700 px-2.5 py-0.5 text-xs text-gray-400">
                PNG, JPG, JPEG, WEBP
              </span>
              <span className="rounded-full bg-navy-700 px-2.5 py-0.5 text-xs text-gray-400">
                Max 5 MB
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 rounded-xl border border-error-red/30 bg-error-red/10 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-error-red" />
            <p className="text-sm text-error-red">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}