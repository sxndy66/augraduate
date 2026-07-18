import { z } from "zod";

export function calculateCGPA(
  previousCGPA: number,
  previousCredits: number,
  currentGPA: number,
  currentCredits: number
): number {
  if (previousCredits < 0 || currentCredits < 0) return 0;
  if (previousCredits === 0 && currentCredits === 0) return 0;

  const totalCredits = previousCredits + currentCredits;
  const totalGradePoints =
    previousCGPA * previousCredits + currentGPA * currentCredits;

  if (totalCredits === 0) return 0;
  return totalGradePoints / totalCredits;
}

export const cgpaInputSchema = z.object({
  previousCGPA: z
    .number()
    .min(0, "Previous CGPA cannot be negative")
    .max(10, "CGPA cannot exceed 10"),
  previousCredits: z
    .number()
    .min(0, "Previous credits cannot be negative"),
  currentGPA: z
    .number()
    .min(0, "Current GPA cannot be negative")
    .max(10, "GPA cannot exceed 10"),
  currentCredits: z
    .number()
    .min(0, "Current credits cannot be negative"),
});

export type CGPAInput = z.infer<typeof cgpaInputSchema>;
