export interface ParsedSubject {
  subject_code: string;
  subject_name: string;
  credits: number;
  grade: string;
  grade_points: number;
  is_arrear: boolean;
  confidence: "high" | "medium" | "low";
}

export function parseOCRText(text: string): ParsedSubject[] {
  const lines = text.split("\n").filter((l) => l.trim());
  const results: ParsedSubject[] = [];

  for (const line of lines) {
    const parts = line.split(/\s{2,}|[|│\/\\]\s*/).filter(Boolean);
    if (parts.length < 3) continue;

    const codeMatch = parts.find((p) => /^[A-Z]{2}\d{4,6}$/i.test(p.trim()));
    const creditMatch = parts.find((p) => /^\d{1}$/.test(p.trim()));
    const gradeMatch = parts.find((p) =>
      /^(O|A\+?|B\+?|C|U|RA|W)$/i.test(p.trim()),
    );

    if (!codeMatch || !creditMatch || !gradeMatch) continue;

    const code = codeMatch.trim().toUpperCase();
    const creditIdx = parts.indexOf(creditMatch);
    const gradeIdx = parts.indexOf(gradeMatch);
    const name = parts
      .slice(1, Math.min(creditIdx, gradeIdx))
      .join(" ")
      .trim();
    const grade = gradeMatch.trim().toUpperCase();

    results.push({
      subject_code: code,
      subject_name: name || "Unknown",
      credits: parseInt(creditMatch.trim(), 10),
      grade,
      grade_points: grade === "O" ? 10 : grade === "A+" ? 9 : grade === "A" ? 8 : grade === "B+" ? 7 : grade === "B" ? 6 : grade === "C" ? 5 : 0,
      is_arrear: ["U", "RA", "W"].includes(grade),
      confidence: name ? "high" : "low",
    });
  }

  return results;
}
