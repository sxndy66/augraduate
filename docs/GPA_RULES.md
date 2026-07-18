# AU Track — GPA Rules & Grading System

## Anna University Grading System

Anna University uses a **10-point grading system** (Grade Point Average — GPA) for all undergraduate and postgraduate programs under R2017 and R2021 regulations.

### Grade to Point Mapping

| Grade | Grade Point | Description | Status |
|-------|-------------|-------------|--------|
| O | 10 | Outstanding | Pass |
| A+ | 9 | Excellent | Pass |
| A | 8 | Very Good | Pass |
| B+ | 7 | Good | Pass |
| B | 6 | Above Average | Pass |
| C | 5 | Average | Pass |
| U | 0 | Fail (Reappear) | Fail — Arrear |
| RA | 0 | Absent / Reappearance | Fail — Arrear |
| SA | — | Shortage of Attendance | Fail (not grade-based) |

> **Note:** "SA" (Shortage of Attendance) is not a grade point — it means the student was not eligible to write the exam. AU Track does not process SA as a grade; students should clear attendance requirements separately.

### Pass Mark
- **Minimum passing mark:** 50 out of 100 (for R2017 and R2021)
- A grade of **C (5 points)** is the minimum passing grade
- **U** and **RA** are failing grades (0 points) and create arrears

## GPA Formula

### Semester GPA

```
GPA = Σ(credits_i × grade_point_i) / Σ(credits_i)
```

Where:
- `credits_i` = credit hours for subject *i*
- `grade_point_i` = grade point earned for subject *i*
- Sum is over all subjects in that semester

**Example:**
| Subject | Credits | Grade | Grade Point |
|---------|---------|-------|-------------|
| CS8492 | 4 | A | 8 |
| CS8493 | 3 | O | 10 |
| CS8494 | 3 | B+ | 7 |
| MA8492 | 4 | A+ | 9 |

```
GPA = (4×8 + 3×10 + 3×7 + 4×9) / (4 + 3 + 3 + 4)
    = (32 + 30 + 21 + 36) / 14
    = 119 / 14
    = 8.50
```

### Cumulative GPA (CGPA)

```
CGPA = Σ(all_credits_i × grade_point_i) / Σ(all_credits_i)
```

Where the sum is over **all subjects across all semesters**.

**Important:** CGPA includes all subjects ever taken, including arrears that have been cleared. When an arrear is cleared (re-exam), the new grade replaces the old U/RA grade in the calculation.

## Edge Cases

### 1. Arrears (U / RA)
- **First attempt (U/RA):** Grade point = 0, included in denominator (credits count) but contributes 0 to numerator
- **After clearing:** New grade replaces old; the old 0-point entry is superseded
- **Impact:** An uncleared arrear drags down both GPA and CGPA because credits are in the denominator but 0 points in the numerator

### 2. Revaluation
- If revaluation results in a grade change, the new grade replaces the old
- AU Track allows editing any grade entry to reflect revaluation outcomes
- The GPA/CGPA recalculates automatically on save

### 3. Elective Subjects
- Elective subjects (PE — Professional Elective, OE — Open Elective) are included in GPA calculation
- Credits for electives count toward total credits and GPA

### 4. Audit Courses
- Audit courses (if any) do not carry credits and are excluded from GPA
- AU Track does not include 0-credit subjects in GPA calculation

### 5. First Semester
- First semester GPA is the same as CGPA (only one semester of data)
- No historical data to cumulative

### 6. Empty Semester
- If a semester has no grade entries, it contributes nothing to CGPA
- GPA for that semester shows as 0.00

### 7. Maximum GPA
- Maximum possible GPA = 10.00 (all O grades)
- Minimum passing GPA = 5.00 (all C grades)

### 8. Grade Case Sensitivity
- Grades are case-insensitive in input ("a+" = "A+")
- Stored and displayed in uppercase
- Validated against the canonical set: O, A+, A, B+, B, C, U, RA

## Implementation in AU Track

### Validator (`lib/validators/gpa.ts`)
```typescript
export const GRADE_POINTS: Record<string, number> = {
  O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, U: 0, RA: 0,
};

export function calculateGPA(grades: GradeEntry[]): number {
  // Σ(credits × gradePoint) / Σ(credits)
  // Skips entries with credits ≤ 0 or gradePoint < 0
}
```

### CGPA Calculation
CGPA is calculated by aggregating all `user_grades` entries across all semesters and applying the same formula. The result is cached in `user_cgpa` table and recalculated on any grade change.

### Rounding
- GPA and CGPA are displayed to **2 decimal places**
- Internal calculations use full floating-point precision
- No rounding is applied during intermediate steps

## Regulation Differences

| Aspect | R2017 | R2021 |
|--------|-------|-------|
| Grading system | 10-point (O to C + U/RA) | Same |
| Pass mark | 50 | 50 |
| Credits (B.E) | 160 | 160 |
| Credits (B.Tech) | 172 | 172 |
| Total semesters | 8 | 8 |

> The grading system is identical across R2017 and R2021. The main differences are in curriculum structure and subject codes, not in GPA calculation.
