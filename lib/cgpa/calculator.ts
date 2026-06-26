import type { ParsedSubject } from "@/lib/ocr/parser";

const gradePoints: Record<string, number> = {
  O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5,
  U: 0, RA: 0, W: 0, AB: 0, SA: 0,
};

export function getGradePoints(grade: string): number {
  return gradePoints[grade.trim().toUpperCase()] ?? 0;
}

export function calculateGPA(subjects: Pick<ParsedSubject, "credits" | "grade">[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const sub of subjects) {
    const pts = getGradePoints(sub.grade);
    if (pts === 0 && ["U", "RA", "W", "AB", "SA"].includes(sub.grade.trim().toUpperCase())) {
      totalCredits += sub.credits;
      continue;
    }
    totalPoints += pts * sub.credits;
    totalCredits += sub.credits;
  }

  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
}

export function detectArrears(subjects: ParsedSubject[]): ParsedSubject[] {
  const failGrades = ["U", "RA", "W", "AB"];
  return subjects.filter((s) => failGrades.includes(s.grade.trim().toUpperCase()));
}

export function getClassification(gpa: number): string {
  if (gpa >= 8.5) return "Distinction";
  if (gpa >= 7.0) return "First Class";
  if (gpa >= 6.0) return "Second Class";
  if (gpa >= 5.0) return "Pass Class";
  return "Fail";
}
