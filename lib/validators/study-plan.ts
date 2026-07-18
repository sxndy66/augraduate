import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const subjectRefSchema = z.object({
  subjectCode: z.string().min(1, "Subject code is required"),
  subjectName: z.string().min(1, "Subject name is required"),
  currentGrade: z.string().min(1, "Current grade is required"),
});

export const studyPlanInputSchema = z.object({
  currentCGPA: z.number().min(0).max(10, "CGPA must be between 0 and 10"),
  targetCGPA: z.number().min(0).max(10, "Target CGPA must be between 0 and 10"),
  remainingSemesters: z.number().int().min(1, "At least 1 remaining semester").max(8),
  completedCredits: z.number().min(0, "Completed credits cannot be negative"),
  totalCredits: z.number().min(1, "Total credits must be at least 1"),
  weakSubjects: z.array(subjectRefSchema).max(20),
  strongSubjects: z.array(subjectRefSchema).max(20),
  studyHoursPerDay: z.number().min(0.5, "At least 0.5 hours").max(16, "Cannot exceed 16 hours"),
  examDaysLeft: z.number().int().min(1, "At least 1 day left").max(365),
  preferredStudyTime: z.enum(["morning", "evening", "night"]),
});

export type StudyPlanInput = z.infer<typeof studyPlanInputSchema>;

// ---------------------------------------------------------------------------
// Output Types
// ---------------------------------------------------------------------------

export interface StudySession {
  subject: string;
  topic: string;
  duration: number; // minutes
  priority: "high" | "medium" | "low";
}

export interface DaySchedule {
  day: string;
  sessions: StudySession[];
}

export interface SubjectStrategy {
  subjectCode: string;
  subjectName: string;
  strategy: string;
  resources: string[];
  priority: "high" | "medium" | "low";
}

export interface StudyPlanOutput {
  planTitle: string;
  summary: string;
  weeklySchedule: DaySchedule[];
  subjectStrategies: SubjectStrategy[];
  dailyGoals: string[];
  weeklyGoals: string[];
  motivationalMessage: string;
  estimatedImprovement: number;
}

// ---------------------------------------------------------------------------
// Grade helpers
// ---------------------------------------------------------------------------

const GRADE_POINTS: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  U: 0,
  RA: 0,
};

function gradeToPoint(grade: string): number {
  return GRADE_POINTS[grade.trim().toUpperCase()] ?? 0;
}

const WEAK_GRADES = new Set(["C", "U", "RA", "ABSENT", "I"]);
const STRONG_GRADES = new Set(["O", "A+", "A"]);

export function isWeakGrade(grade: string): boolean {
  return WEAK_GRADES.has(grade.trim().toUpperCase());
}

export function isStrongGrade(grade: string): boolean {
  return STRONG_GRADES.has(grade.trim().toUpperCase());
}

// ---------------------------------------------------------------------------
// Topic banks per subject category (rule-based, no AI needed)
// ---------------------------------------------------------------------------

const TOPIC_BANK: string[] = [
  "Concept review & fundamentals",
  "Previous year question practice",
  "Problem-solving & numericals",
  "Formula memorization & shortcuts",
  "Mock test & self-assessment",
  "Revision of weak areas",
  "Group discussion & doubt clearing",
  "Important derivations & proofs",
  "Case studies & applications",
  "Quick recap & flashcards",
];

const RESOURCE_BANK: Record<string, string[]> = {
  theory: [
    "Textbook: prescribed edition, chapters 1-5",
    "Class notes & handwritten summaries",
    "YouTube: NPTEL / university lectures",
    "Previous 3 years' question papers",
  ],
  practical: [
    "Lab manual & observation notebook",
    "Practice problems from reference book",
    "Online coding platforms (if applicable)",
    "Step-by-step solved examples",
  ],
  math: [
    "Formula sheet (create your own)",
    "Worked examples from textbook",
    "Previous year numerical problems",
    "Khan Academy / NPTEL for concepts",
  ],
};

function inferSubjectType(subjectName: string): "theory" | "practical" | "math" {
  const lower = subjectName.toLowerCase();
  if (lower.includes("math") || lower.includes("mathematics") || lower.includes("calculus") || lower.includes("algebra") || lower.includes("differential") || lower.includes("probability") || lower.includes("statistics") || lower.includes("transforms") || lower.includes("numerical")) {
    return "math";
  }
  if (lower.includes("lab") || lower.includes("practical") || lower.includes("workshop") || lower.includes("programming") || lower.includes("coding") || lower.includes("data structures")) {
    return "practical";
  }
  return "theory";
}

// ---------------------------------------------------------------------------
// Days of the week
// ---------------------------------------------------------------------------

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ---------------------------------------------------------------------------
// Core generator
// ---------------------------------------------------------------------------

export function generateStudyPlan(input: StudyPlanInput): StudyPlanOutput {
  const {
    currentCGPA,
    targetCGPA,
    remainingSemesters,
    completedCredits,
    totalCredits,
    weakSubjects,
    strongSubjects,
    studyHoursPerDay,
    examDaysLeft,
    preferredStudyTime,
  } = input;

  const cgpaGap = Math.max(0, targetCGPA - currentCGPA);
  const remainingCredits = Math.max(0, totalCredits - completedCredits);

  // -- Estimated improvement ------------------------------------------------
  // If the student follows the plan, estimate how much CGPA can improve
  // based on exam days left, study hours, and gap.
  const studyIntensity = Math.min(1, studyHoursPerDay / 6); // 6 hrs/day = full intensity
  const timeFactor = Math.min(1, examDaysLeft / 60); // 60 days = full time
  const gapFactor = cgpaGap > 0 ? Math.min(1, cgpaGap / 2) : 0.5;
  const estimatedImprovement = parseFloat(
    (cgpaGap * studyIntensity * timeFactor * gapFactor * 0.85).toFixed(2)
  );

  // -- Plan title -----------------------------------------------------------
  const planTitle =
    cgpaGap > 0
      ? `Road to ${targetCGPA.toFixed(2)} CGPA — ${examDaysLeft} Days to Exams`
      : `Maintain & Excel — ${examDaysLeft} Days Study Plan`;

  // -- Summary --------------------------------------------------------------
  const weakCount = weakSubjects.length;
  const totalWeeklyHours = studyHoursPerDay * 7;
  const summaryParts: string[] = [];

  summaryParts.push(
    `You're currently at ${currentCGPA.toFixed(2)} CGPA targeting ${targetCGPA.toFixed(2)}.`
  );
  summaryParts.push(
    `With ${examDaysLeft} days until exams and ${studyHoursPerDay} hours of study per day, you have ${totalWeeklyHours.toFixed(0)} weekly study hours.`
  );

  if (weakCount > 0) {
    summaryParts.push(
      `${weakCount} weak ${weakCount === 1 ? "subject" : "subjects"} need${weakCount === 1 ? "s" : ""} priority attention.`
    );
  } else {
    summaryParts.push("No critically weak subjects detected — focus on maintaining consistency.");
  }

  if (cgpaGap > 1.5) {
    summaryParts.push(
      `The gap of ${cgpaGap.toFixed(2)} is significant. This plan front-loads weak subjects and allocates intensive revision blocks.`
    );
  } else if (cgpaGap > 0) {
    summaryParts.push(
      `The gap of ${cgpaGap.toFixed(2)} is achievable with consistent effort. This plan balances weak subjects with ongoing coursework.`
    );
  }

  summaryParts.push(
    `Your preferred study time is ${preferredStudyTime}. Sessions are scheduled accordingly.`
  );

  const summary = summaryParts.join(" ");

  // -- Subject strategies ---------------------------------------------------
  const subjectStrategies: SubjectStrategy[] = weakSubjects.map((s) => {
    const currentPoint = gradeToPoint(s.currentGrade);
    const gradeGap = 10 - currentPoint;
    const subjectType = inferSubjectType(s.subjectName);
    const resources = RESOURCE_BANK[subjectType];

    let strategy = "";
    if (s.currentGrade === "U" || s.currentGrade === "RA") {
      strategy = `This subject needs a complete restart. Start from the basics — read the textbook chapters in order, create summary notes for each unit, and solve every example. Focus on understanding core concepts before attempting problems. Allocate the maximum time here.`;
    } else if (gradeGap >= 5) {
      strategy = `Your current grade of ${s.currentGrade} indicates significant gaps. Prioritize this subject with daily study sessions. Break the syllabus into manageable units, master one unit at a time, and practice previous year questions for each unit before moving on.`;
    } else if (gradeGap >= 3) {
      strategy = `You're close but need targeted improvement. Identify the specific topics where you lose marks, create focused revision notes, and practice 5+ problems daily from those areas. Take a mock test every week to track progress.`;
    } else {
      strategy = `You have a decent foundation. Polish weak topics, practice advanced problems, and focus on presentation quality to push for a higher grade. Review previous year papers to identify recurring question patterns.`;
    }

    const priority: "high" | "medium" | "low" =
      gradeGap >= 5 ? "high" : gradeGap >= 3 ? "medium" : "low";

    return {
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      strategy,
      resources,
      priority,
    };
  });

  // Also add strategies for strong subjects (maintenance)
  for (const s of strongSubjects.slice(0, 3)) {
    const subjectType = inferSubjectType(s.subjectName);
    subjectStrategies.push({
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      strategy: `You're performing well in this subject (grade: ${s.currentGrade}). Maintain your standard with lighter revision sessions — review key concepts twice a week and solve a few problems to stay sharp. Use this subject's study time to support weaker subjects.`,
      resources: RESOURCE_BANK[subjectType],
      priority: "low",
    });
  }

  // -- Weekly schedule ------------------------------------------------------
  const weeklySchedule: DaySchedule[] = [];
  const totalMinutesPerDay = Math.round(studyHoursPerDay * 60);

  // Build a priority queue of subjects to study
  type StudyItem = {
    subjectCode: string;
    subjectName: string;
    priority: "high" | "medium" | "low";
    weight: number;
  };

  const studyItems: StudyItem[] = [];

  // Weak subjects get higher weight
  for (const s of weakSubjects) {
    const currentPoint = gradeToPoint(s.currentGrade);
    const gradeGap = 10 - currentPoint;
    const weight = gradeGap >= 5 ? 3 : gradeGap >= 3 ? 2 : 1;
    const priority: "high" | "medium" | "low" =
      gradeGap >= 5 ? "high" : gradeGap >= 3 ? "medium" : "low";
    studyItems.push({
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      priority,
      weight,
    });
  }

  // Strong subjects get lower weight
  for (const s of strongSubjects.slice(0, 3)) {
    studyItems.push({
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      priority: "low",
      weight: 0.5,
    });
  }

  // If no subjects provided, create generic sessions
  if (studyItems.length === 0) {
    studyItems.push({
      subjectCode: "GENERAL",
      subjectName: "General Study",
      priority: "medium",
      weight: 1,
    });
  }

  const totalWeight = studyItems.reduce((sum, item) => sum + item.weight, 0);

  // Distribute sessions across 7 days
  // Sunday is a lighter day (revision + rest)
  for (let i = 0; i < 7; i++) {
    const day = DAYS[i];
    const isSunday = i === 6;
    const dayMinutes = isSunday
      ? Math.round(totalMinutesPerDay * 0.6) // 60% on Sunday
      : totalMinutesPerDay;

    const sessions: StudySession[] = [];
    let remainingMinutes = dayMinutes;
    let topicIndex = i; // rotate topics per day

    // Sort items by weight descending for this day
    const dayItems = [...studyItems].sort((a, b) => b.weight - a.weight);

    for (const item of dayItems) {
      if (remainingMinutes <= 0) break;

      const allocatedMinutes = Math.round(
        (item.weight / totalWeight) * dayMinutes
      );

      if (allocatedMinutes < 15) continue; // skip very short sessions

      // Split into 2 sessions if allocation is large
      const numSessions = allocatedMinutes > 90 ? 2 : 1;
      const perSession = Math.round(allocatedMinutes / numSessions);

      for (let j = 0; j < numSessions; j++) {
        if (remainingMinutes < 15) break;
        const duration = Math.min(perSession, remainingMinutes);
        const topic = TOPIC_BANK[topicIndex % TOPIC_BANK.length];
        topicIndex++;

        sessions.push({
          subject: item.subjectName,
          topic,
          duration,
          priority: item.priority,
        });

        remainingMinutes -= duration;
      }
    }

    // Add a revision session on Sunday
    if (isSunday && remainingMinutes > 0) {
      sessions.push({
        subject: "Weekly Revision",
        topic: "Review all topics covered this week",
        duration: Math.min(remainingMinutes, 60),
        priority: "medium",
      });
    }

    weeklySchedule.push({ day, sessions });
  }

  // -- Daily goals ----------------------------------------------------------
  const dailyGoals: string[] = [];

  if (weakCount > 0) {
    dailyGoals.push(`Spend at least ${Math.round(studyHoursPerDay * 0.5)} hours on your weakest subject: ${weakSubjects[0].subjectName}`);
  }
  dailyGoals.push(`Complete ${studyHoursPerDay} hours of focused study during your ${preferredStudyTime} slot`);
  dailyGoals.push("Review yesterday's notes for 15 minutes before starting new topics");
  dailyGoals.push("Solve at least 5 practice problems from any subject");
  dailyGoals.push("Take a 10-minute break every 50 minutes to maintain focus");
  if (examDaysLeft <= 30) {
    dailyGoals.push("Attempt one full mock test or previous year paper");
  }
  dailyGoals.push("Update your progress tracker before bed");

  // -- Weekly goals ---------------------------------------------------------
  const weeklyGoals: string[] = [];

  weeklyGoals.push(`Complete all ${studyHoursPerDay}-hour study sessions for 6 days + revision on Sunday`);
  if (weakCount > 0) {
    weeklyGoals.push(`Finish one full unit in each weak subject (${weakSubjects.map((s) => s.subjectName).slice(0, 3).join(", ")}${weakCount > 3 ? ", etc." : ""})`);
  }
  weeklyGoals.push("Create or update summary notes for all topics covered this week");
  weeklyGoals.push("Take at least 2 mock tests across your subjects");
  weeklyGoals.push(`Aim to improve your practice test scores by 5-10% from last week`);
  if (cgpaGap > 0) {
    weeklyGoals.push(`Track your CGPA trajectory — you need to gain ${cgpaGap.toFixed(2)} points over ${remainingSemesters} semester${remainingSemesters > 1 ? "s" : ""}`);
  }
  weeklyGoals.push("Get 7-8 hours of sleep daily to maintain study efficiency");

  // -- Motivational message -------------------------------------------------
  let motivationalMessage = "";
  if (cgpaGap > 1.5) {
    motivationalMessage = `The gap to your target CGPA of ${targetCGPA.toFixed(2)} is challenging but absolutely achievable. Every hour you put in now compounds — small daily efforts create massive results. Remember: the students who succeed aren't the ones who never struggle, they're the ones who never quit. You've got ${examDaysLeft} days. Make every one of them count! 💪`;
  } else if (cgpaGap > 0) {
    motivationalMessage = `You're closer than you think! Just ${cgpaGap.toFixed(2)} CGPA points away from your target. Consistency is your superpower — show up every day, even when motivation dips. ${examDaysLeft} days of focused effort can transform your academic trajectory. Believe in yourself and keep pushing! 🚀`;
  } else {
    motivationalMessage = `You've already reached your target CGPA — that's an incredible achievement! Now it's about maintaining excellence and pushing your limits. Use this study plan to stay sharp, build deeper understanding, and set an even higher goal. Excellence is a habit, not an act! 🌟`;
  }

  return {
    planTitle,
    summary,
    weeklySchedule,
    subjectStrategies,
    dailyGoals,
    weeklyGoals,
    motivationalMessage,
    estimatedImprovement,
  };
}
