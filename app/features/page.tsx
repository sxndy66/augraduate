"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ScanLine, TrendingUp, AlertTriangle, Target, Bell, BarChart3,
  ArrowRight, CheckCircle2, Sparkles, FileText, Camera, Brain,
  LineChart, CalendarClock, Trophy, Zap, Eye, GraduationCap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const features = [
  {
    icon: ScanLine,
    title: "OCR Grade Extraction",
    tagline: "Snap. Upload. Done.",
    description:
      "Upload a screenshot or photo of your grade sheet and our AI-powered OCR engine automatically extracts every subject code, grade, and credit point. No manual data entry required.",
    benefits: [
      "Supports Anna University grade sheet format",
      "Batch extraction for all subjects at once",
      "Review and edit before saving",
      "Works with screenshots and photos",
      "High accuracy with Tesseract.js OCR engine",
    ],
    mockup: "ocr",
    color: "blue",
  },
  {
    icon: TrendingUp,
    title: "CGPA & GPA Tracking",
    tagline: "Know your numbers instantly.",
    description:
      "Real-time CGPA calculation using Anna University's grading system. View per-semester GPA breakdowns, track your progress over time, and see exactly where you stand.",
    benefits: [
      "Accurate CGPA using AU's 10-point grading",
      "Per-semester GPA breakdown",
      "Visual trend charts across semesters",
      "Automatic credit-weighted calculations",
      "Grade-to-point conversion built in",
    ],
    mockup: "cgpa",
    color: "indigo",
  },
  {
    icon: AlertTriangle,
    title: "Arrear Management",
    tagline: "Never lose track of a backlog.",
    description:
      "Track arrears across all semesters, see which subjects are cleared and which still need attention. Get a clear picture of your arrear history and plan your comeback.",
    benefits: [
      "Track arrears across all semesters",
      "Mark subjects as cleared when re-taken",
      "Arrear count and history at a glance",
      "Priority alerts for pending arrears",
      "Impact analysis on your CGPA",
    ],
    mockup: "arrear",
    color: "amber",
  },
  {
    icon: Target,
    title: "Target CGPA Planner",
    tagline: "Set goals. Reach them.",
    description:
      "Set your dream CGPA target and AU Track calculates exactly what grades you need in upcoming semesters to reach it. Plan your academic strategy with precision.",
    benefits: [
      "Set a target CGPA goal",
      "Get required GPA per upcoming semester",
      "Scenario planning with different grade outcomes",
      "Progress tracking toward your target",
      "Motivational milestones along the way",
    ],
    mockup: "planner",
    color: "green",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    tagline: "Stay on top of what matters.",
    description:
      "Never miss an important academic deadline. Get notified about exam registrations, result announcements, fee payment dates, and arrear clearing opportunities.",
    benefits: [
      "Exam registration reminders",
      "Result announcement alerts",
      "Fee payment deadline notifications",
      "Arrear exam opportunities",
      "Custom notification preferences",
    ],
    mockup: "notifications",
    color: "red",
  },
  {
    icon: BarChart3,
    title: "Academic Insights Dashboard",
    tagline: "See the big picture.",
    description:
      "Beautiful visual dashboards showing your academic performance trends, strongest subjects, areas needing improvement, and comparative analysis across semesters.",
    benefits: [
      "Interactive performance charts",
      "Subject-wise grade distribution",
      "Semester-over-semester comparison",
      "Strength and weakness analysis",
      "Export-ready academic summary",
    ],
    mockup: "insights",
    color: "blue",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-electric-blue/10", text: "text-electric-blue", border: "border-electric-blue/20" },
  indigo: { bg: "bg-royal-indigo/10", text: "text-royal-indigo", border: "border-royal-indigo/20" },
  green: { bg: "bg-success-green/10", text: "text-success-green", border: "border-success-green/20" },
  amber: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/20" },
  red: { bg: "bg-error-red/10", text: "text-error-red", border: "border-error-red/20" },
};

function MockupPreview({ type, color }: { type: string; color: string }) {
  const c = colorMap[color];

  const mockups: Record<string, React.ReactNode> = {
    ocr: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-navy-600 bg-navy-800/40 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-700">
            <Camera className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="h-3 w-32 rounded bg-navy-600" />
            <div className="mt-1.5 h-2 w-48 rounded bg-navy-700" />
          </div>
          <Badge color="blue" icon={<Sparkles className="h-3 w-3" />}>Scanning</Badge>
        </div>
        {["MA3251 — A+", "CS3351 — A", "EC3351 — B+"].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center justify-between rounded-lg border border-navy-600 bg-navy-800/40 p-3"
          >
            <span className="font-mono text-sm text-gray-300">{row}</span>
            <CheckCircle2 className="h-4 w-4 text-success-green" />
          </motion.div>
        ))}
      </div>
    ),
    cgpa: (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-navy-600 bg-navy-800/40 p-4">
          <div>
            <p className="text-xs text-gray-400">Current CGPA</p>
            <p className="text-3xl font-bold text-white">8.42</p>
          </div>
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${c.bg}`}>
            <TrendingUp className={`h-7 w-7 ${c.text}`} />
          </div>
        </div>
        <div className="flex items-end gap-2">
          {[6.5, 7.2, 7.8, 8.1, 8.4].map((h, i) => (
            <div key={i} className="flex-1">
              <div
                className="rounded-t bg-gradient-to-t from-electric-blue/40 to-electric-blue"
                style={{ height: `${h * 8}px` }}
              />
              <p className="mt-1 text-center text-xs text-gray-500">S{i + 1}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    arrear: (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-success-green/20 bg-success-green/5 p-3">
          <span className="text-sm text-gray-300">Arrears Cleared</span>
          <Badge color="green">2 / 2</Badge>
        </div>
        {[
          { sub: "Engineering Graphics", status: "Cleared", color: "green" as const },
          { sub: "Physics II", status: "Cleared", color: "green" as const },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-navy-600 bg-navy-800/40 p-3">
            <span className="text-sm text-gray-300">{row.sub}</span>
            <Badge color={row.color} icon={<CheckCircle2 className="h-3 w-3" />}>{row.status}</Badge>
          </div>
        ))}
      </div>
    ),
    planner: (
      <div className="space-y-4">
        <div className="rounded-xl border border-navy-600 bg-navy-800/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Target CGPA</span>
            <span className="text-xl font-bold text-amber">9.00</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Current CGPA</span>
            <span className="text-xl font-bold text-white">8.42</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-700">
            <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-amber to-success-green" />
          </div>
        </div>
        <div className="rounded-lg border border-amber/20 bg-amber/5 p-3 text-center">
          <p className="text-sm text-gray-300">Need <span className="font-bold text-amber">9.6 GPA</span> in next 2 semesters</p>
        </div>
      </div>
    ),
    notifications: (
      <div className="space-y-2">
        {[
          { icon: FileText, text: "Exam registration opens in 3 days", color: "blue" as const },
          { icon: CalendarClock, text: "Fee payment due on 15th", color: "amber" as const },
          { icon: Trophy, text: "You reached 8.4 CGPA! 🎉", color: "green" as const },
        ].map((n, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-navy-600 bg-navy-800/40 p-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[n.color].bg}`}>
              <n.icon className={`h-4 w-4 ${colorMap[n.color].text}`} />
            </div>
            <span className="text-sm text-gray-300">{n.text}</span>
          </div>
        ))}
      </div>
    ),
    insights: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-navy-600 bg-navy-800/40 p-3 text-center">
            <p className="text-xs text-gray-400">Best Subject</p>
            <p className="mt-1 text-sm font-semibold text-success-green">DSA — A+</p>
          </div>
          <div className="rounded-lg border border-navy-600 bg-navy-800/40 p-3 text-center">
            <p className="text-xs text-gray-400">Focus Area</p>
            <p className="mt-1 text-sm font-semibold text-amber">OS — B+</p>
          </div>
        </div>
        <div className="rounded-lg border border-navy-600 bg-navy-800/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Grade Distribution</span>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            {[
              { grade: "O", count: 3, color: "bg-success-green" },
              { grade: "A+", count: 5, color: "bg-electric-blue" },
              { grade: "A", count: 4, color: "bg-royal-indigo" },
              { grade: "B+", count: 2, color: "bg-amber" },
              { grade: "B", count: 1, color: "bg-error-red/60" },
            ].map((g, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className={`w-full rounded-t ${g.color}`} style={{ height: `${g.count * 12}px` }} />
                <span className="text-xs text-gray-500">{g.grade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className={`rounded-xl border ${c.border} bg-navy-900/40 p-5`}>
      {mockups[type]}
    </div>
  );
}

export default function FeaturesPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5 },
  };

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute left-1/2 top-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-electric-blue/10 blur-[100px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <Badge color="blue" icon={<Sparkles className="h-3 w-3" />} className="mb-6">
              Feature Deep Dive
            </Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl text-balance">
              Six Features That{" "}
              <span className="gradient-text">Transform</span>{" "}
              Your Academic Life
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 text-balance">
              Each feature is designed to solve a real problem Anna University students face.
              Here&apos;s everything AU Track can do for you.
            </p>
          </motion.div>
        </section>

        {/* Feature sections */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-24">
            {features.map((feature, i) => {
              const c = colorMap[feature.color];
              const reversed = i % 2 === 1;

              return (
                <div
                  key={i}
                  className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${
                    reversed ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Text */}
                  <motion.div
                    initial={{ opacity: 0, x: reversed ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${c.bg} ${c.text}`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <Badge color={feature.color as any} className="mb-3">{feature.tagline}</Badge>
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">{feature.title}</h2>
                    <p className="mt-4 text-gray-400">{feature.description}</p>
                    <ul className="mt-6 space-y-3">
                      {feature.benefits.map((benefit, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${c.text}`} />
                          <span className="text-sm text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Mockup */}
                  <motion.div
                    initial={{ opacity: 0, x: reversed ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card gradientBorder className="p-2">
                      <MockupPreview type={feature.mockup} color={feature.color} />
                    </Card>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="mx-auto max-w-3xl">
            <Card gradientBorder className="p-10 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-blue to-royal-indigo shadow-lg shadow-electric-blue/25">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
              <p className="mx-auto mt-4 max-w-md text-gray-400">
                Join fellow Anna University students who track their academic journey smarter.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg" leftIcon={<Eye className="h-5 w-5" />}>
                    Try the Demo
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
}
