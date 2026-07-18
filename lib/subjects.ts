import { readFileSync } from "fs";
import { join } from "path";

export interface Subject {
  subject_code: string;
  subject_name: string;
  credits: number;
  category: string;
  is_elective: boolean;
  semester_number: number;
}

const SUBJECTS_DIR = join(process.cwd(), "data", "anna-university", "subjects");

/**
 * Load subjects for a given branch and regulation from JSON files.
 */
export function getSubjects(branch: string, regulation: string): Subject[] {
  try {
    const filePath = join(SUBJECTS_DIR, `${branch}-${regulation}.json`);
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Subject[];
  } catch {
    return [];
  }
}

/**
 * Load subjects for a specific semester.
 */
export function getSubjectsBySemester(
  branch: string,
  regulation: string,
  semester: number
): Subject[] {
  return getSubjects(branch, regulation).filter(
    (s) => s.semester_number === semester
  );
}

/**
 * Check if subject data is available for a branch + regulation.
 */
export function isSubjectDataAvailable(branch: string, regulation: string): boolean {
  try {
    const filePath = join(SUBJECTS_DIR, `${branch}-${regulation}.json`);
    readFileSync(filePath, "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all branches that have subject data.
 */
export function getAvailableBranchesWithSubjects(): string[] {
  try {
    const indexPath = join(SUBJECTS_DIR, "index.json");
    const raw = readFileSync(indexPath, "utf-8");
    const index = JSON.parse(raw) as Array<{ branch: string }>;
    const branches = index.map((e) => e.branch);
    return Array.from(new Set(branches));
  } catch {
    return [];
  }
}

/**
 * Get all branch + regulation combos that have subject data.
 */
export function getAvailableSubjectCombos(): Array<{ branch: string; regulation: string }> {
  try {
    const indexPath = join(SUBJECTS_DIR, "index.json");
    const raw = readFileSync(indexPath, "utf-8");
    const index = JSON.parse(raw) as Array<{ branch: string; regulation: string }>;
    return index.map((e) => ({ branch: e.branch, regulation: e.regulation }));
  } catch {
    return [];
  }
}