import { z } from "zod";

export const GRADE_POINTS: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  U: 0,
  RA: 0,
};

export const VALID_GRADES = Object.keys(GRADE_POINTS);

export function getGradePoint(grade: string): number {
  const normalized = grade.trim().toUpperCase();
  return GRADE_POINTS[normalized] ?? -1;
}

export function isValidGrade(grade: string): boolean {
  const normalized = grade.trim().toUpperCase();
  return normalized in GRADE_POINTS;
}

export interface GradeEntry {
  credits: number;
  gradePoint: number;
}

export function calculateGPA(grades: GradeEntry[]): number {
  if (!grades || grades.length === 0) return 0;

  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const g of grades) {
    if (g.credits <= 0 || g.gradePoint < 0) continue;
    totalCredits += g.credits;
    totalGradePoints += g.credits * g.gradePoint;
  }

  if (totalCredits === 0) return 0;
  return totalGradePoints / totalCredits;
}

export const gradeEntrySchema = z.object({
  subject_code: z.string().min(1, "Subject code is required"),
  subject_name: z.string().min(1, "Subject name is required"),
  credits: z.number().int().positive("Credits must be a positive integer"),
  grade: z.string().refine((val) => isValidGrade(val), {
    message: `Grade must be one of: ${VALID_GRADES.join(", ")}`,
  }),
  semester_number: z.number().int().min(1).max(8),
  category: z.enum(["HS", "BS", "ES", "PC", "PE", "OE"]).optional(),
  is_elective: z.boolean().optional().default(false),
});

export const semesterSchema = z.object({
  semester_number: z.number().int().min(1).max(8),
  grades: z.array(gradeEntrySchema).min(1, "At least one subject is required"),
});

export type GradeEntryInput = z.infer<typeof gradeEntrySchema>;
export type SemesterInput = z.infer<typeof semesterSchema>;
