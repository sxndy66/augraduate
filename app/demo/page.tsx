"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, BookOpen, AlertTriangle, Target, Bell, GraduationCap,
  CheckCircle2, Clock, Award, BarChart3, Calendar, Zap, Trophy,
  FileText, CalendarClock, Info,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

const semesterData = [
  { sem: 1, gpa: 7.2, status: "Completed" },
  { sem: 2, gpa: 7.8, status: "Completed" },
  { sem: 3, gpa: 8.1, status: "Completed" },
  { sem: 4, gpa: 8.4, status: "Completed" },
  { sem: 5, gpa: 8.7, status: "Completed" },
  { sem: 6, gpa: 0, status: "Upcoming" },
];

const gradeTable = [
  { subject: "Transforms and Partial Differential Equations", code: "MA3251", credits: 4, grade: "A", points: 9 },
  { subject: "Data Structures and Algorithms", code: "CS3351", credits: 4, grade: "A+", points: 10 },
  { subject: "Operating Systems", code: "CS3491", credits: 3, grade: "B+", points: 8 },
  { subject: "Object Oriented Programming", code: "CS3391", credits: 3, grade: "A", points: 9 },
  { subject: "Database Management Systems", code: "CS3492", credits: 3, grade: "A+", points: 10 },
  { subject: "Professional Communication", code: "GE3361", credits: 2, grade: "A", points: 9 },
];

const arrearData = [
  { subject: "Engineering Graphics", code: "GE3251", semester: "Sem 1", status: "Cleared", clearedIn: "Sem 3" },
  { subject: "Physics for Information Science", code: "PH3251", semester: "Sem 2", status: "Cleared", clearedIn: "Sem 4" },
];

const notifications = [
  { icon: FileText, title: "Exam Registration Open", message: "Semester 6 exam registration starts in 3 days", time: "2h ago", color: "blue" as const },
  { icon: CalendarClock, title: "Fee Payment Reminder", message: "Tuition fee due on July 15th", time: "5h ago", color: "amber" as const },
  { icon: Trophy, title: "CGPA Milestone Reached!", message: "You crossed 8.5 CGPA this semester 🎉", time: "1d ago", color: "green" as const },
  { icon: AlertTriangle, title: "Arrear Exam Window", message: "Arrear exam registration for Physics II is open", time: "2d ago", color: "red" as const },
  { icon: Info, title: "Results Published", message: "Semester 5 results are now available to upload", time: "3d ago", color: "indigo" as const },
];

const gradeColorMap: Record<string, "green" | "blue" | "amber" | "red"> = {
  "O": "green", "A+": "green", "A": "blue", "B+": "amber", "B": "amber", "C": "red", "U": "red",
};

const notifColorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-electric-blue/10", text: "text-electric-blue" },
  amber: { bg: "bg-amber/10", text: "text-amber" },
  green: { bg: "bg-success-green/10", text: "text-success-green" },
  red: { bg: "bg-error-red/10", text: "text-error-red" },
  indigo: { bg: "bg-royal-indigo/10", text: "text-royal-indigo" },
};

export default function DemoPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.4 },
  };

  const currentCGPA = 8.42;
  const targetCGPA = 9.0;
  const progressPercent = (currentCGPA / targetCGPA) * 100;

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-16">
        {/* Header */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Badge color="indigo" icon={<Zap className="h-3 w-3" />} className="mb-3">
              Interactive Demo
            </Badge>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Demo Dashboard</h1>
            <p className="mt-2 text-gray-400">
              A preview of your academic dashboard with realistic sample data.
            </p>
          </div>
          <div className="glass-card flex items-center gap-3 rounded-xl px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-electric-blue to-royal-indigo">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Demo Student</p>
              <p className="text-xs text-gray-400">CSE — 5th Semester</p>
            </div>
          </div>
        </div>
      </motion.div>
        </section>

        {/* Stats Grid */}
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4"
          >
            {[
              { label: "Current CGPA", value: "8.42", icon: TrendingUp, trend: { value: "+0.32 this sem", direction: "up" as const }, color: "blue" as const },
              { label: "Semesters", value: "5 / 8", icon: BookOpen, color: "indigo" as const },
              { label: "Arrears", value: "0", icon: AlertTriangle, trend: { value: "2 cleared", direction: "up" as const }, color: "green" as const },
              { label: "Target CGPA", value: "9.00", icon: Target, color: "amber" as const },
            ].map((stat, i) => {
              const colorClasses = {
                blue: "text-electric-blue bg-electric-blue/10",
                indigo: "text-royal-indigo bg-royal-indigo/10",
                green: "text-success-green bg-success-green/10",
                amber: "text-amber bg-amber/10",
              };
              return (
                <Card key={i} hover className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[stat.color]}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  {stat.trend && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success-green" />
                      <span className="text-xs font-medium text-success-green">{stat.trend.value}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </motion.div>
        </section>

        {/* CGPA + Semester Cards */}
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
            {/* CGPA Display */}
            <motion.div {...fadeInUp} className="lg:col-span-1">
              <Card gradientBorder className="h-full p-6">
                <h3 className="text-sm font-semibold text-gray-400">CGPA Overview</h3>
                <div className="mt-6 flex flex-col items-center">
                  <div className="relative flex h-40 w-40 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="8" />
                      <motion.circle
                        cx="80" cy="80" r="70" fill="none" stroke="url(#cgpaGradient)" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 70}
                        initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - currentCGPA / 10) }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="cgpaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-bold text-white">{currentCGPA.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">out of 10</span>
                    </div>
                  </div>
                  <div className="mt-6 w-full">
                    <ProgressBar
                      value={progressPercent}
                      label="Progress to Target (9.00)"
                      showValue
                      color="amber"
                      size="sm"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Semester Cards */}
            <motion.div {...fadeInUp} className="lg:col-span-2">
              <Card className="h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-400">Semester Performance</h3>
                  <Badge color="blue" icon={<BarChart3 className="h-3 w-3" />}>5 Semesters</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {semesterData.map((sem, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className={`rounded-xl border p-4 ${
                        sem.status === "Completed"
                          ? "border-navy-600 bg-navy-800/40"
                          : "border-dashed border-navy-700 bg-navy-900/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">Sem {sem.sem}</span>
                        {sem.status === "Completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-success-green" />
                        ) : (
                          <Clock className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <p className={`mt-2 text-2xl font-bold ${sem.status === "Completed" ? "text-white" : "text-gray-600"}`}>
                        {sem.status === "Completed" ? sem.gpa.toFixed(1) : "—"}
                      </p>
                      <p className="text-xs text-gray-500">{sem.status}</p>
                      {sem.status === "Completed" && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-electric-blue to-royal-indigo"
                            style={{ width: `${(sem.gpa / 10) * 100}%` }}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Grade Table + Arrear Preview */}
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Grade Table */}
            <motion.div {...fadeInUp} className="lg:col-span-2">
              <Card className="h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-400">Semester 5 — Grade Details</h3>
                  <Badge color="green" icon={<Award className="h-3 w-3" />}>8.7 GPA</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-700">
                        <th className="pb-3 text-left font-medium text-gray-400">Subject</th>
                        <th className="pb-3 text-left font-medium text-gray-400">Code</th>
                        <th className="pb-3 text-center font-medium text-gray-400">Credits</th>
                        <th className="pb-3 text-center font-medium text-gray-400">Grade</th>
                        <th className="pb-3 text-center font-medium text-gray-400">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-700/50">
                      {gradeTable.map((row, i) => (
                        <tr key={i} className="hover:bg-navy-800/30 transition-colors">
                          <td className="py-3 text-gray-300">{row.subject}</td>
                          <td className="py-3 font-mono text-xs text-gray-400">{row.code}</td>
                          <td className="py-3 text-center text-gray-300">{row.credits}</td>
                          <td className="py-3 text-center">
                            <Badge color={gradeColorMap[row.grade] || "amber"}>{row.grade}</Badge>
                          </td>
                          <td className="py-3 text-center font-semibold text-white">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-navy-700">
                        <td className="pt-3 font-semibold text-gray-300" colSpan={2}>Total Credits: 19</td>
                        <td className="pt-3 text-center font-semibold text-gray-300">19</td>
                        <td className="pt-3 text-right font-semibold text-electric-blue" colSpan={2}>GPA: 8.70</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            </motion.div>

            {/* Arrear Preview */}
            <motion.div {...fadeInUp} className="lg:col-span-1">
              <Card className="h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-400">Arrear Status</h3>
                  <Badge color="green" icon={<CheckCircle2 className="h-3 w-3" />}>All Cleared</Badge>
                </div>
                <div className="space-y-3">
                  {arrearData.map((arrear, i) => (
                    <div key={i} className="rounded-xl border border-success-green/20 bg-success-green/5 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{arrear.subject}</p>
                          <p className="mt-0.5 font-mono text-xs text-gray-400">{arrear.code}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success-green" />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                        <span>{arrear.semester}</span>
                        <span>→</span>
                        <span className="text-success-green">Cleared in {arrear.clearedIn}</span>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border border-dashed border-navy-700 bg-navy-900/30 p-4 text-center">
                    <Trophy className="mx-auto h-6 w-6 text-amber" />
                    <p className="mt-2 text-sm font-medium text-white">No Active Arrears!</p>
                    <p className="mt-1 text-xs text-gray-400">Keep up the great work 🎉</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Notifications + Target Planner */}
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Notification Feed */}
            <motion.div {...fadeInUp}>
              <Card className="h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-400">Notification Feed</h3>
                  <Badge color="red">3 New</Badge>
                </div>
                <div className="space-y-3">
                  {notifications.map((n, i) => {
                    const c = notifColorMap[n.color];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 rounded-xl border border-navy-600 bg-navy-800/30 p-4 hover:border-navy-500 transition-colors"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.bg}`}>
                          <n.icon className={`h-4 w-4 ${c.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{n.message}</p>
                          <p className="mt-1 text-xs text-gray-600">{n.time}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Target Planner Preview */}
            <motion.div {...fadeInUp}>
              <Card className="h-full p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-400">Target CGPA Planner</h3>
                  <Badge color="amber" icon={<Target className="h-3 w-3" />}>Goal: 9.00</Badge>
                </div>

                <div className="space-y-5">
                  <div className="rounded-xl border border-navy-600 bg-navy-800/40 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Current CGPA</p>
                        <p className="text-3xl font-bold text-white">{currentCGPA.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Target</p>
                        <p className="text-3xl font-bold text-amber">{targetCGPA.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <ProgressBar value={progressPercent} color="amber" size="md" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{progressPercent.toFixed(0)}% of the way there!</p>
                  </div>

                  <div className="rounded-xl border border-amber/20 bg-amber/5 p-5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber" />
                      <p className="text-sm font-semibold text-white">What You Need</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Sem 6 required GPA</span>
                        <span className="font-bold text-amber">9.2</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Sem 7 required GPA</span>
                        <span className="font-bold text-amber">9.4</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Sem 8 required GPA</span>
                        <span className="font-bold text-amber">9.6</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-success-green/20 bg-success-green/5 p-4">
                    <Trophy className="h-5 w-5 text-success-green" />
                    <p className="text-sm text-gray-300">
                      You&apos;re on track! Maintain consistent performance to reach your goal.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Demo Notice */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="mx-auto max-w-3xl">
            <Card className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric-blue/10 text-electric-blue">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">This is a demo with sample data</p>
                <p className="mt-1 text-sm text-gray-400">
                  All grades, CGPA values, and notifications shown here are fictional sample data
                  for demonstration purposes. Create an account to track your real academic data.
                </p>
              </div>
            </Card>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
}
