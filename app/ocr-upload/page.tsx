"use client"

export const dynamic = 'force-dynamic';;

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ScanText,
  ShieldOff,
  Keyboard,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { UploadZone } from "@/components/ocr/UploadZone";
import { OCRProgress, type OCRStage } from "@/components/ocr/OCRProgress";
import { OCRResults } from "@/components/ocr/OCRResults";
import { OCRConfirm } from "@/components/ocr/OCRConfirm";
import { createClient } from "@/lib/supabase/client";
import { extractGradesFromText, type OCRGradeEntry } from "@/lib/validators/ocr";
import { isValidGrade } from "@/lib/validators/gpa";

type Step = "upload" | "processing" | "results" | "confirm";

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
  label: `Semester ${i + 1}`,
  value: String(i + 1),
}));

export default function OCRUploadPage() {
  return (
    <ProtectedRoute>
      <OCRUploadContent />
    </ProtectedRoute>
  );
}

function OCRUploadContent() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [semester, setSemester] = useState<string>("1");
  const [showPrivacy, setShowPrivacy] = useState(true);

  // OCR state
  const [ocrStage, setOcrStage] = useState<OCRStage>("idle");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrMessage, setOcrMessage] = useState("");
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Results
  const [entries, setEntries] = useState<OCRGradeEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileSelected = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setOcrError(null);
  }, []);

  const handleFileCleared = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setEntries([]);
    setOcrStage("idle");
    setOcrProgress(0);
    setOcrError(null);
    setStep("upload");
  }, [previewUrl]);

  const runOCR = useCallback(async () => {
    if (!file) return;

    setStep("processing");
    setOcrStage("loading");
    setOcrProgress(0);
    setOcrMessage("Initializing Tesseract.js OCR engine…");
    setOcrError(null);

    try {
      // Dynamic import to avoid loading Tesseract on every page load
      const Tesseract = (await import("tesseract.js")).default;

      setOcrStage("recognizing");
      setOcrMessage("Reading text from your screenshot…");

      const result = await Tesseract.recognize(file, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(m.progress * 100);
          }
        },
      });

      setOcrStage("extracting");
      setOcrMessage("Parsing subject codes and grades from extracted text…");
      setOcrProgress(100);

      const rawText = result.data.text;
      const extracted = extractGradesFromText(rawText);

      if (extracted.length === 0) {
        setOcrStage("error");
        setOcrError(
          "No grades could be extracted from this image. The screenshot may be unclear or use an unsupported format. Try a clearer image or use manual entry."
        );
        setStep("upload");
        return;
      }

      // Mark confidence and validate
      const validated = extracted.map((e) => ({
        ...e,
        grade: isValidGrade(e.grade) ? e.grade.toUpperCase() : e.grade,
      }));

      setEntries(validated);
      setOcrStage("done");
      setOcrMessage(`Successfully extracted ${validated.length} grade entries.`);
      setStep("results");

      toast({
        type: "success",
        title: "OCR Complete",
        message: `${validated.length} grades extracted. Please review for accuracy.`,
      });
    } catch (err) {
      console.error("OCR error:", err);
      setOcrStage("error");
      setOcrError(
        err instanceof Error
          ? `OCR processing failed: ${err.message}`
          : "OCR processing failed unexpectedly. Please try again or use manual entry."
      );
      setStep("upload");
      toast({
        type: "error",
        title: "OCR Failed",
        message: "Could not process the image. Please try a clearer screenshot.",
      });
    }
  }, [file, toast]);

  const handleConfirm = useCallback(async () => {
    setIsSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast({ type: "error", title: "Not authenticated", message: "Please log in again." });
        router.push("/login");
        return;
      }

      const validEntries = entries.filter(
        (e) => isValidGrade(e.grade) && e.subject_code.trim().length > 0 && e.credits > 0
      );

      if (validEntries.length === 0) {
        toast({ type: "error", title: "No valid grades", message: "Fix entries before saving." });
        setIsSaving(false);
        return;
      }

      const rows = validEntries.map((e) => ({
        user_id: session.user.id,
        subject_code: e.subject_code.toUpperCase(),
        subject_name: e.subject_name,
        credits: e.credits,
        grade: e.grade.toUpperCase(),
        semester_number: parseInt(semester, 10),
        source: "ocr" as const,
      }));

      const { error: insertError } = await supabase
        .from("user_grades")
        .upsert(rows, {
          onConflict: "user_id,subject_code,semester_number",
        });

      if (insertError) throw insertError;

      toast({
        type: "success",
        title: "Grades Saved",
        message: `${validEntries.length} grades saved to Semester ${semester}.`,
      });

      router.push(`/semesters/${semester}`);
    } catch (err) {
      console.error("Save error:", err);
      toast({
        type: "error",
        title: "Save Failed",
        message: err instanceof Error ? err.message : "Could not save grades. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [supabase, entries, semester, router, toast]);

  const handleDeleteScreenshot = useCallback(() => {
    handleFileCleared();
    toast({ type: "info", title: "Screenshot Deleted", message: "Your image has been removed." });
  }, [handleFileCleared, toast]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-electric-blue to-royal-indigo text-white">
              <ScanText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">OCR Grade Upload</h1>
              <p className="text-sm text-gray-400">
                Upload a screenshot of your results and extract grades automatically
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Dashboard
          </Button>
        </div>

        {/* Privacy Notice */}
        {showPrivacy && (
          <Card className="mb-6 border-amber/20 bg-amber/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldOff className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber">Privacy Notice</p>
                <p className="mt-1 text-sm text-gray-300">
                  Your screenshot is processed <strong>entirely in your browser</strong> using
                  client-side OCR (Tesseract.js). The image is never uploaded to our servers. Only
                  the extracted grade data — which you review and confirm — is saved to your
                  account. You can delete the screenshot at any time.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivacy(false)}
                className="!px-2"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="space-y-6">
            <Card className="p-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-200">
                Select Semester
              </label>
              <Select
                options={SEMESTER_OPTIONS}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="max-w-xs"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Grades will be saved under this semester.
              </p>
            </Card>

            <UploadZone
              onFileSelected={handleFileSelected}
              onFileCleared={handleFileCleared}
              previewUrl={previewUrl}
            />

            {ocrError && (
              <ErrorState
                title="OCR Error"
                message={ocrError}
                onRetry={file ? runOCR : undefined}
                retryLabel="Try Again"
              />
            )}

            {file && !ocrError && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Badge color="blue">{file.name}</Badge>
                  <Badge color="gray">{(file.size / (1024 * 1024)).toFixed(2)} MB</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDeleteScreenshot}
                    leftIcon={<EyeOff className="h-4 w-4" />}
                  >
                    Delete Screenshot
                  </Button>
                  <Button
                    variant="primary"
                    onClick={runOCR}
                    leftIcon={<Sparkles className="h-4 w-4" />}
                  >
                    Run OCR
                  </Button>
                </div>
              </div>
            )}

            {/* Manual entry fallback */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Keyboard className="h-5 w-5 text-electric-blue" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Prefer manual entry?</p>
                  <p className="text-xs text-gray-400">
                    Enter grades by hand without uploading a screenshot.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/semesters/${semester}`)}
                >
                  Manual Entry →
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="space-y-6">
            <OCRProgress stage={ocrStage} progress={ocrProgress} message={ocrMessage} />
            {previewUrl && (
              <Card className="overflow-hidden p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Processing"
                  className="max-h-[300px] w-full rounded-xl object-contain opacity-60"
                />
              </Card>
            )}
          </div>
        )}

        {/* Step: Results */}
        {step === "results" && (
          <div className="space-y-6">
            <OCRProgress stage={ocrStage} progress={ocrProgress} message={ocrMessage} />
            <OCRResults entries={entries} onChange={setEntries} />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back to Upload
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep("confirm")}
                disabled={entries.length === 0}
              >
                Review & Confirm →
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div className="space-y-6">
            <OCRConfirm
              entries={entries}
              semesterNumber={parseInt(semester, 10)}
              onConfirm={handleConfirm}
              onBack={() => setStep("results")}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}