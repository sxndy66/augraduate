"use client";

import { motion } from "framer-motion";
import { Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { DaySchedule, StudySession } from "@/lib/validators/study-plan";

interface WeeklyScheduleProps {
  schedule: DaySchedule[];
}

const priorityColors: Record<string, "red" | "amber" | "blue"> = {
  high: "red",
  medium: "amber",
  low: "blue",
};

const priorityBorder: Record<string, string> = {
  high: "border-l-error-red",
  medium: "border-l-amber",
  low: "border-l-electric-blue",
};

const dayAbbrev: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function getTotalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.duration, 0);
}

export function WeeklySchedule({ schedule }: WeeklyScheduleProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-electric-blue" />
        <h3 className="text-lg font-semibold text-white">Weekly Schedule</h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {schedule.map((day, dayIndex) => {
          const totalMin = getTotalMinutes(day.sessions);
          const isSunday = day.day === "Sunday";

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: dayIndex * 0.05 }}
              className={cn(
                "rounded-xl border p-4",
                isSunday
                  ? "border-royal-indigo/30 bg-royal-indigo/5"
                  : "border-navy-600 bg-navy-800/40"
              )}
            >
              {/* Day header */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{day.day}</p>
                  <p className="text-xs text-gray-400">{dayAbbrev[day.day]}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {formatDuration(totalMin)}
                </div>
              </div>

              {/* Sessions */}
              <div className="space-y-2">
                {day.sessions.length === 0 ? (
                  <p className="py-4 text-center text-xs text-gray-500">Rest day</p>
                ) : (
                  day.sessions.map((session, sIndex) => (
                    <div
                      key={sIndex}
                      className={cn(
                        "rounded-lg border-l-2 bg-navy-900/40 p-2.5",
                        priorityBorder[session.priority]
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-gray-200">
                          {session.subject}
                        </p>
                        <Badge color={priorityColors[session.priority]} className="shrink-0 text-[10px]">
                          {session.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{session.topic}</p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDuration(session.duration)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {isSunday && day.sessions.length > 0 && (
                <p className="mt-2 text-center text-[10px] font-medium text-royal-indigo">
                  📝 Revision Day
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
