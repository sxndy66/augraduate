"use client";

import { motion } from "framer-motion";
import { BookOpen, Lightbulb, Link2, Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { SubjectStrategy as SubjectStrategyType } from "@/lib/validators/study-plan";

interface SubjectStrategyProps {
  strategy: SubjectStrategyType;
  index: number;
}

const priorityConfig: Record<
  string,
  { color: "red" | "amber" | "blue"; label: string; border: string; bg: string }
> = {
  high: {
    color: "red",
    label: "High Priority",
    border: "border-error-red/20",
    bg: "bg-error-red/5",
  },
  medium: {
    color: "amber",
    label: "Medium Priority",
    border: "border-amber/20",
    bg: "bg-amber/5",
  },
  low: {
    color: "blue",
    label: "Low Priority",
    border: "border-electric-blue/20",
    bg: "bg-electric-blue/5",
  },
};

export function SubjectStrategy({ strategy, index }: SubjectStrategyProps) {
  const config = priorityConfig[strategy.priority] ?? priorityConfig.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className={cn("p-5", config.border, config.bg)}>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700/50">
              <BookOpen className="h-5 w-5 text-electric-blue" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{strategy.subjectName}</h4>
              <p className="font-mono text-xs text-gray-400">{strategy.subjectCode}</p>
            </div>
          </div>
          <Badge color={config.color} icon={<Flag className="h-3 w-3" />}>
            {config.label}
          </Badge>
        </div>

        {/* Strategy text */}
        <div className="mb-4 rounded-lg border border-navy-600 bg-navy-800/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber" />
            <span className="text-xs font-semibold text-gray-300">Strategy</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">{strategy.strategy}</p>
        </div>

        {/* Resources */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-electric-blue" />
            <span className="text-xs font-semibold text-gray-300">Recommended Resources</span>
          </div>
          <ul className="space-y-1.5">
            {strategy.resources.map((resource, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-electric-blue" />
                {resource}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
}
