import { NextRequest, NextResponse } from "next/server";
import {
  studyPlanInputSchema,
  generateStudyPlan,
  type StudyPlanOutput,
} from "@/lib/validators/study-plan";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = studyPlanInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = result.data;

    // Additional validation
    if (input.completedCredits > input.totalCredits) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credits",
          message: "Completed credits cannot exceed total credits.",
        },
        { status: 400 }
      );
    }

    // Check if Gemini API key is available for optional AI enhancement
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const aiPlan = await generateWithGemini(input, geminiApiKey);
        if (aiPlan) {
          return NextResponse.json({
            success: true,
            data: aiPlan,
            source: "ai",
          });
        }
      } catch {
        // Fall through to rule-based generation
      }
    }

    // Rule-based generation (always works, no API needed)
    const plan = generateStudyPlan(input);

    return NextResponse.json({
      success: true,
      data: plan,
      source: "rule-based",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Optional Gemini AI integration — only used if GEMINI_API_KEY is set
// ---------------------------------------------------------------------------

async function generateWithGemini(
  input: ReturnType<typeof studyPlanInputSchema.parse>,
  apiKey: string
): Promise<StudyPlanOutput | null> {
  const prompt = buildGeminiPrompt(input);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    // Validate the AI response has required fields, fall back if not
    if (
      parsed.planTitle &&
      parsed.summary &&
      Array.isArray(parsed.weeklySchedule) &&
      Array.isArray(parsed.subjectStrategies)
    ) {
      return parsed as StudyPlanOutput;
    }
    return null;
  } catch {
    return null;
  }
}

function buildGeminiPrompt(
  input: ReturnType<typeof studyPlanInputSchema.parse>
): string {
  return `You are an academic study planner for Anna University engineering students.
Generate a personalized study plan as valid JSON with this exact structure:

{
  "planTitle": string,
  "summary": string,
  "weeklySchedule": [{ "day": string, "sessions": [{ "subject": string, "topic": string, "duration": number, "priority": "high"|"medium"|"low" }] }],
  "subjectStrategies": [{ "subjectCode": string, "subjectName": string, "strategy": string, "resources": [string], "priority": "high"|"medium"|"low" }],
  "dailyGoals": [string],
  "weeklyGoals": [string],
  "motivationalMessage": string,
  "estimatedImprovement": number
}

Student details:
- Current CGPA: ${input.currentCGPA}
- Target CGPA: ${input.targetCGPA}
- Remaining semesters: ${input.remainingSemesters}
- Completed credits: ${input.completedCredits} / ${input.totalCredits}
- Study hours per day: ${input.studyHoursPerDay}
- Exam days left: ${input.examDaysLeft}
- Preferred study time: ${input.preferredStudyTime}

Weak subjects (grades C, U, RA, or absent):
${input.weakSubjects.map((s) => `- ${s.subjectCode}: ${s.subjectName} (current grade: ${s.currentGrade})`).join("\n")}

Strong subjects (grades O, A+, A):
${input.strongSubjects.map((s) => `- ${s.subjectCode}: ${s.subjectName} (current grade: ${s.currentGrade})`).join("\n")}

Rules:
1. Prioritize weak subjects with more study time
2. Create a 7-day weekly schedule (Monday-Sunday) with study sessions
3. Each session should have a specific topic and duration in minutes
4. Sunday should be a revision day
5. Generate specific strategies for each weak subject
6. Create 5-7 daily goals and 5-7 weekly goals
7. estimatedImprovement should be a realistic number (0-2 range)
8. All durations should fit within the daily study hours
9. Respond with ONLY the JSON, no markdown`;
}
