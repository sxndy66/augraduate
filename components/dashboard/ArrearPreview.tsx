import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface ArrearItem {
  id: string;
  subject_code: string;
  subject_name: string;
  semester: number;
  attempts: number;
  status: string;
}

interface ArrearPreviewProps {
  arrears: ArrearItem[];
}

export function ArrearPreview({ arrears }: ArrearPreviewProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber" />
          <h2 className="text-lg font-semibold text-white">Arrear Tracker</h2>
        </div>
        <Link
          href="/arrears"
          className="flex items-center gap-1 text-sm font-medium text-electric-blue hover:text-electric-blue/80"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {arrears.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="No pending arrears"
          description="You're all caught up! No arrears to track."
        />
      ) : (
        <div className="space-y-3">
          {arrears.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-navy-600 bg-navy-800/40 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">
                    {item.subject_code}
                  </span>
                  <Badge color="amber">Sem {item.semester}</Badge>
                </div>
                <p className="mt-1 truncate text-sm text-gray-200">
                  {item.subject_name}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <span className="text-xs text-gray-400">
                  {item.attempts} {item.attempts === 1 ? "attempt" : "attempts"}
                </span>
                <Badge
                  color={
                    item.status === "pending"
                      ? "red"
                      : item.status === "registered"
                        ? "amber"
                        : "green"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
          {arrears.length > 4 && (
            <p className="text-center text-xs text-gray-500">
              +{arrears.length - 4} more arrears
            </p>
          )}
        </div>
      )}
    </Card>
  );
}