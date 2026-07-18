import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { getGradePoint } from "@/lib/validators/gpa";

interface GradeRow {
  subject_code: string;
  subject_name: string;
  credits: number;
  grade: string;
}

interface GradeTablePreviewProps {
  semester: number;
  grades: GradeRow[];
}

function getGradeBadgeColor(grade: string): "green" | "blue" | "amber" | "red" | "gray" {
  const gp = getGradePoint(grade);
  if (gp >= 8) return "green";
  if (gp >= 6) return "blue";
  if (gp >= 5) return "amber";
  if (gp === 0) return "red";
  return "gray";
}

export function GradeTablePreview({ semester, grades }: GradeTablePreviewProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-electric-blue" />
          <h2 className="text-lg font-semibold text-white">
            Semester {semester} Grades
          </h2>
        </div>
        <Link
          href={`/semesters/${semester}`}
          className="flex items-center gap-1 text-sm font-medium text-electric-blue hover:text-electric-blue/80"
        >
          View detail <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {grades.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No grades entered"
          description="Start entering your semester grades to see them here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-600 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="pb-3 pr-4 font-medium">Code</th>
                <th className="pb-3 pr-4 font-medium">Subject</th>
                <th className="pb-3 pr-4 text-center font-medium">Credits</th>
                <th className="pb-3 text-center font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.slice(0, 6).map((row) => (
                <tr
                  key={row.subject_code}
                  className="border-b border-navy-700/50 last:border-0"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-gray-300">
                    {row.subject_code}
                  </td>
                  <td className="py-3 pr-4 text-gray-200">
                    {row.subject_name}
                  </td>
                  <td className="py-3 pr-4 text-center text-gray-300">
                    {row.credits}
                  </td>
                  <td className="py-3 text-center">
                    <Badge color={getGradeBadgeColor(row.grade)}>
                      {row.grade}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {grades.length > 6 && (
            <p className="mt-3 text-center text-xs text-gray-500">
              +{grades.length - 6} more subjects
            </p>
          )}
        </div>
      )}
    </Card>
  );
}