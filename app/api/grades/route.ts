import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateGPA, getGradePoints, detectArrears } from "@/lib/cgpa/calculator";
import { sanitizeText } from "@/lib/utils";
import { z } from "zod";

const SubjectSchema = z.object({
  subject_code: z.string().regex(/^[A-Z]{2,3}\d{4}$/, "Invalid subject code"),
  subject_name: z.string().min(1).max(100),
  credits: z.number().int().min(1).max(6),
  grade: z.enum(["O", "A+", "A", "B+", "B", "C", "U", "AB", "SA", "RA", "W"]),
});

const SaveGradesSchema = z.object({
  semester_number: z.number().int().min(1).max(8),
  subjects: z.array(SubjectSchema).min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SaveGradesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { semester_number, subjects } = parsed.data;

    // Sanitize all text fields
    const cleanSubjects = subjects.map((s) => ({
      ...s,
      subject_name: sanitizeText(s.subject_name),
      grade_points: getGradePoints(s.grade),
      is_arrear: s.grade === "U" || s.grade === "RA" || s.grade === "AB",
      arrear_cleared: false,
      confidence: "high" as const,
    }));

    const gpa = calculateGPA(cleanSubjects);
    const totalCredits = cleanSubjects
      .filter((s) => !["U", "AB", "SA", "RA"].includes(s.grade))
      .reduce((sum, s) => sum + s.credits, 0);

    // Upsert semester (update if already exists for this sem number)
    const { data: existingSem } = await supabase
      .from("semesters")
      .select("id")
      .eq("student_id", user.id)
      .eq("semester_number", semester_number)
      .single();

    let semesterId: string;

    if (existingSem) {
      // Update existing semester
      const { error } = await supabase
        .from("semesters")
        .update({ gpa, total_credits: totalCredits, is_complete: true })
        .eq("id", existingSem.id);

      if (error) throw error;
      semesterId = existingSem.id;

      // Delete old subjects to replace them
      await supabase.from("subjects").delete().eq("semester_id", semesterId);
    } else {
      // Insert new semester
      const { data: newSem, error } = await supabase
        .from("semesters")
        .insert({
          student_id: user.id,
          semester_number,
          gpa,
          total_credits: totalCredits,
          is_complete: true,
        })
        .select("id")
        .single();

      if (error || !newSem) throw error ?? new Error("Semester insert failed");
      semesterId = newSem.id;
    }

    // Insert subjects
    const subjectRows = cleanSubjects.map((s) => ({
      semester_id: semesterId,
      subject_code: s.subject_code,
      subject_name: s.subject_name,
      credits: s.credits,
      grade: s.grade,
      grade_points: s.grade_points,
      is_arrear: s.is_arrear,
      arrear_cleared: false,
    }));

    const { error: subError } = await supabase.from("subjects").insert(subjectRows);
    if (subError) throw subError;

    const arrears = detectArrears(cleanSubjects);

    return NextResponse.json({
      success: true,
      semester_id: semesterId,
      gpa,
      total_credits: totalCredits,
      subjects_saved: cleanSubjects.length,
      arrears_detected: arrears.length,
    });
  } catch (err: unknown) {
    console.error("grades/save error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const semesterNumber = url.searchParams.get("semester");

    const query = supabase
      .from("semesters")
      .select("*, subjects(*)")
      .eq("student_id", user.id)
      .order("semester_number", { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    if (semesterNumber) {
      const sem = data?.find((s) => s.semester_number === parseInt(semesterNumber));
      return NextResponse.json({ data: sem ?? null });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error("grades/get error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
