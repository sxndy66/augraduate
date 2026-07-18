"use client";

import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

interface ArrearStatsProps {
  total: number;
  pending: number;
  cleared: number;
}

export function ArrearStats({ total, pending, cleared }: ArrearStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Total Arrears"
        value={total}
        icon={<AlertCircle className="h-5 w-5" />}
        color="blue"
      />
      <StatCard
        label="Pending"
        value={pending}
        icon={<Clock className="h-5 w-5" />}
        color="amber"
      />
      <StatCard
        label="Cleared"
        value={cleared}
        icon={<CheckCircle2 className="h-5 w-5" />}
        color="green"
      />
    </div>
  );
}
