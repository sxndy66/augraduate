import { z } from "zod";

export interface TargetPlan {
  requiredGPA: number;
  isAchievable: boolean;
  message: string;
}

export interface PlanResult {
  safe: TargetPlan;
  aggressive: TargetPlan;
  remainingCredits: number;
  totalCredits: number;
}

export function calculateRequiredGPA(
  currentCGPA: number,
  targetCGPA: number,
  completedCredits: number,
  totalCredits: number,
  remainingCredits: number
): number {
  if (remainingCredits <= 0) return 0;
  if (totalCredits <= 0) return 0;

  const requiredTotalPoints = targetCGPA * totalCredits;
  const currentTotalPoints = currentCGPA * completedCredits;
  const neededPoints = requiredTotalPoints - currentTotalPoints;
  const requiredGPA = neededPoints / remainingCredits;

  return Math.max(0, requiredGPA);
}

export function generatePlan(
  currentCGPA: number,
  targetCGPA: number,
  completedCredits: number,
  totalCredits: number,
  remainingCredits: number
): PlanResult {
  const requiredGPA = calculateRequiredGPA(
    currentCGPA,
    targetCGPA,
    completedCredits,
    totalCredits,
    remainingCredits
  );

  const isAchievable = requiredGPA <= 10 && requiredGPA >= 0;

  // Safe plan: spread across all remaining semesters evenly
  const safeRequiredGPA = requiredGPA;
  const safeAchievable = safeRequiredGPA <= 10 && safeRequiredGPA >= 0;

  // Aggressive plan: assume higher GPA in earlier semesters, lower in later
  // This means the student needs a slightly higher GPA now to build a buffer
  const aggressiveRequiredGPA = Math.min(10, requiredGPA * 1.1);
  const aggressiveAchievable = aggressiveRequiredGPA <= 10;

  const safeMessage = safeAchievable
    ? `You need an average GPA of ${safeRequiredGPA.toFixed(2)} in each remaining semester to reach your target CGPA of ${targetCGPA.toFixed(2)}.`
    : `Unfortunately, reaching a CGPA of ${targetCGPA.toFixed(2)} is not mathematically possible. The maximum achievable CGPA with perfect 10.0 GPA in all remaining semesters would be ${((currentCGPA * completedCredits + 10 * remainingCredits) / totalCredits).toFixed(2)}.`;

  const aggressiveMessage = aggressiveAchievable
    ? `For a buffer, aim for ${aggressiveRequiredGPA.toFixed(2)} GPA in upcoming semesters. This gives you flexibility to dip slightly in later semesters while still hitting your target.`
    : `Even with an aggressive approach, reaching ${targetCGPA.toFixed(2)} is not feasible. Consider adjusting your target CGPA.`;

  return {
    safe: {
      requiredGPA: safeRequiredGPA,
      isAchievable: safeAchievable,
      message: safeMessage,
    },
    aggressive: {
      requiredGPA: aggressiveRequiredGPA,
      isAchievable: aggressiveAchievable,
      message: aggressiveMessage,
    },
    remainingCredits,
    totalCredits,
  };
}

export const targetPlanSchema = z.object({
  currentCGPA: z.number().min(0).max(10),
  targetCGPA: z.number().min(0).max(10),
  completedCredits: z.number().min(0),
  totalCredits: z.number().min(0),
  remainingCredits: z.number().min(0),
});

export type TargetPlanInput = z.infer<typeof targetPlanSchema>;
