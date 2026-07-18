import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/ocr
 *
 * Server-side OCR processing route. If a Gemini API key is configured,
 * the image is sent to Google Gemini Vision for text extraction.
 * Otherwise, returns an error directing the client to use client-side
 * Tesseract.js OCR instead.
 *
 * Request body (multipart/form-data):
 *   - file:   Image file (png, jpg, jpeg, webp) — max 5 MB
 *   - semester: Optional semester number (1–8)
 *
 * Response (200):
 *   { success: true, text: string, grades: OCRGradeEntry[] }
 *
 * Response (400/401/500):
 *   { success: false, error: string, clientSideOcr: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    // --- Auth check ---
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // --- Parse multipart form ---
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const semester = formData.get("semester") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided. Attach an image file as 'file'." },
        { status: 400 }
      );
    }

    // --- Validate file type ---
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Accepted types: PNG, JPG, JPEG, WEBP.`,
        },
        { status: 400 }
      );
    }

    // --- Validate file size ---
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 5 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
        },
        { status: 400 }
      );
    }

    // --- Validate semester if provided ---
    if (semester !== null) {
      const semNum = parseInt(semester, 10);
      if (isNaN(semNum) || semNum < 1 || semNum > 8) {
        return NextResponse.json(
          { success: false, error: "Semester must be a number between 1 and 8." },
          { status: 400 }
        );
      }
    }

    // --- Check for Gemini API key ---
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Server-side OCR is not configured. Please use client-side OCR (Tesseract.js) on the upload page. The image is processed entirely in your browser — no data is sent to the server.",
          clientSideOcr: true,
        },
        { status: 501 }
      );
    }

    // --- Gemini Vision OCR ---
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Extract all subject codes, subject names, credits, and grades from this grade screenshot. Return the result as a JSON array where each object has: subject_code, subject_name, credits (number), grade (one of O, A+, A, B+, B, C, U, RA). Only include rows that have a subject code and grade. Do not include headers or footers.",
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        {
          success: false,
          error: "OCR service error. Please try again or use client-side OCR.",
          clientSideOcr: true,
        },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();
    const extractedText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let grades: Array<{
      subject_code: string;
      subject_name: string;
      credits: number;
      grade: string;
    }> = [];

    try {
      grades = JSON.parse(extractedText);
    } catch {
      // If Gemini didn't return clean JSON, fall back to regex extraction
      const { extractGradesFromText } = await import("@/lib/validators/ocr");
      grades = extractGradesFromText(extractedText);
    }

    // Validate grades
    const validGrades = grades.filter(
      (g) =>
        g.subject_code &&
        g.subject_code.trim().length > 0 &&
        g.grade &&
        ["O", "A+", "A", "B+", "B", "C", "U", "RA"].includes(
          g.grade.toUpperCase()
        ) &&
        g.credits > 0 &&
        g.credits <= 10
    );

    return NextResponse.json({
      success: true,
      text: extractedText,
      grades: validGrades,
    });
  } catch (error) {
    console.error("OCR route error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during OCR processing.",
        clientSideOcr: true,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ocr
 * Returns API status and usage info.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/ocr",
    method: "POST",
    description: "Server-side OCR processing for grade screenshots",
    acceptedTypes: ACCEPTED_TYPES,
    maxFileSize: "5 MB",
    requiresAuth: true,
    serverSideAvailable: !!process.env.GEMINI_API_KEY,
    fallback: "Client-side Tesseract.js OCR at /ocr-upload",
  });
}