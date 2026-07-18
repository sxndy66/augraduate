import { z } from "zod";
import { isValidGrade, getGradePoint } from "./gpa";

export const ocrGradeEntrySchema = z.object({
  subject_code: z.string(),
  subject_name: z.string(),
  credits: z.number().or(z.string().transform((v) => parseInt(v, 10))),
  grade: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});

export const ocrResultSchema = z.object({
  institution: z.string().optional(),
  register_number: z.string().optional(),
  student_name: z.string().optional(),
  semester: z.number().optional(),
  regulation: z.string().optional(),
  grades: z.array(ocrGradeEntrySchema),
  raw_text: z.string().optional(),
});

export type OCRResult = z.infer<typeof ocrResultSchema>;
export type OCRGradeEntry = z.infer<typeof ocrGradeEntrySchema>;

/**
 * Extracts grade entries from raw OCR text.
 * Expected line format variations:
 *   "CS8492  Software Engineering  4  A+"
 *   "CS8492 Software Engineering 4 A+"
 *   "CS8492 | Software Engineering | 4 | A+"
 *
 * Falls back to regex-based extraction for less structured text.
 */
export function extractGradesFromText(text: string): OCRGradeEntry[] {
  if (!text || text.trim().length === 0) return [];

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const results: OCRGradeEntry[] = [];

  // Pattern: subject_code (alphanumeric with digits) ... credits (number) ... grade (O/A+/A/B+/B/C/U/RA)
  const gradePattern = /\b(O|A\+|A|B\+|B|C|U|RA)\b/i;
  const subjectCodePattern = /\b([A-Z]{2,4}\s?\d{2,5}[A-Z]?)\b/i;
  const creditsPattern = /\b(\d{1,2})\b/;

  for (const line of lines) {
    // Skip lines that are clearly headers or non-grade lines
    if (/^(course|subject|code|name|credits|grade|result|grade\s*point|slot)/i.test(line)) {
      continue;
    }
    if (line.length < 5) continue;

    const gradeMatch = line.match(gradePattern);
    const codeMatch = line.match(subjectCodePattern);

    if (gradeMatch && codeMatch) {
      const grade = gradeMatch[1].toUpperCase();
      if (!isValidGrade(grade)) continue;

      // Extract credits — find numbers that are not part of the subject code
      const codeEnd = codeMatch.index! + codeMatch[0].length;
      const afterCode = line.substring(codeEnd);
      const creditsMatch = afterCode.match(creditsPattern);

      // Extract subject name — text between code and credits/grade
      const remaining = afterCode.replace(gradeMatch[0], "").trim();
      const creditsIdx = remaining.match(creditsPattern);
      let subjectName = remaining;

      if (creditsIdx && creditsIdx.index !== undefined) {
        subjectName = remaining.substring(0, creditsIdx.index).trim();
      }

      // Clean up subject name
      subjectName = subjectName.replace(/[|,\t]+/g, " ").replace(/\s+/g, " ").trim();

      const credits = creditsMatch ? parseInt(creditsMatch[1], 10) : 0;

      if (credits > 0 && credits <= 10 && subjectName.length > 0) {
        results.push({
          subject_code: codeMatch[1].replace(/\s/g, ""),
          subject_name: subjectName,
          credits,
          grade,
          confidence: 0.85,
        });
      }
    }
  }

  return results;
}

/**
 * Validates and normalizes OCR results, filtering out invalid entries.
 */
export function validateOCRResult(data: unknown): OCRResult | null {
  const parsed = ocrResultSchema.safeParse(data);
  if (!parsed.success) return null;

  // Filter grades to only valid ones
  const validGrades = parsed.data.grades.filter((g) =>
    isValidGrade(typeof g.grade === "string" ? g.grade : String(g.grade))
  );

  return {
    ...parsed.data,
    grades: validGrades.map((g) => ({
      ...g,
      credits:
        typeof g.credits === "string" ? parseInt(g.credits, 10) : g.credits,
      grade: g.grade.toUpperCase(),
    })),
  };
}
