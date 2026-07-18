"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap, ArrowRight, ArrowUpRight, Sparkles, ScanLine,
  TrendingUp, Bell, Target, BookOpen, Calendar, AlertTriangle,
  CheckCircle2, FileText, Shield, Zap, BarChart3, Trophy, Brain,
  Github, Mail, Lock, Eye, Trash2, Users, Clock, Download, Wifi,
} from "lucide-react";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const problems = [
  {
    icon: AlertTriangle,
    title: "Manual CGPA Calculation",
    description: "Spreadsheets and calculators are error-prone and tedious. One wrong credit value skews everything.",
  },
  {
    icon: BookOpen,
    title: "Arrear Blindness",
    description: "Losing track of which subjects you've cleared and which still haunt you across semesters.",
  },
  {
    icon: Calendar,
    title: "No Semester Overview",
    description: "Can't see your GPA trend across all semesters in one place to understand your trajectory.",
  },
  {
    icon: Target,
    title: "No Target Planning",
    description: "No way to figure out what grades you need next semester to reach your CGPA goal.",
  },
  {
    icon: Bell,
    title: "Missed Deadlines",
    description: "Forgetting exam registrations, fee payments, and important academic dates.",
  },
];

const featureColorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-electric-blue/10", text: "text-electric-blue" },
  indigo: { bg: "bg-royal-indigo/10", text: "text-royal-indigo" },
  amber: { bg: "bg-amber/10", text: "text-amber" },
  green: { bg: "bg-success-green/10", text: "text-success-green" },
  red: { bg: "bg-error-red/10", text: "text-error-red" },
};

const features = [
  {
    icon: ScanLine,
    title: "OCR Grade Extraction",
    description: "Upload your grade screenshot and let AI extract every subject, grade, and credit automatically.",
    color: "blue",
  },
  {
    icon: TrendingUp,
    title: "CGPA & GPA Tracking",
    description: "Real-time CGPA calculation with per-semester GPA breakdowns and visual trend charts.",
    color: "indigo",
  },
  {
    icon: AlertTriangle,
    title: "Arrear Management",
    description: "Track arrears across semesters, see what's cleared, and plan your comeback strategically.",
    color: "amber",
  },
  {
    icon: Target,
    title: "Target CGPA Planner",
    description: "Set your dream CGPA and get exact grades needed in upcoming semesters to reach it.",
    color: "green",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get reminded about exam registrations, result dates, and arrear clearing opportunities.",
    color: "red",
  },
  {
    icon: Brain,
    title: "AI Study Plan",
    description: "Get a personalized weekly study schedule with subject strategies, daily goals, and CGPA improvement projections based on your weak subjects and exam timeline.",
    color: "indigo",
  },
  {
    icon: BarChart3,
    title: "Academic Insights",
    description: "Visual dashboards showing your strengths, weaknesses, and academic performance trends.",
    color: "blue",
  },
  {
    icon: Zap,
    title: "Install as App",
    description: "Add AU Track to your home screen as a PWA. Get a native app experience with offline access to your grades and data.",
    color: "indigo",
  },
  {
    icon: CheckCircle2,
    title: "Works Offline",
    description: "View your CGPA, grades, and notes even without internet. Your data syncs automatically when you reconnect.",
    color: "green",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload Screenshot",
    description: "Snap a photo or screenshot of your grade sheet. Our OCR engine reads it instantly.",
    icon: ScanLine,
  },
  {
    number: "02",
    title: "Auto Extraction",
    description: "AI extracts subject codes, grades, and credits with high accuracy. Review and confirm.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Track & Analyze",
    description: "View your CGPA, semester breakdowns, arrears, and trends in a beautiful dashboard.",
    icon: BarChart3,
  },
  {
    number: "04",
    title: "Plan & Improve",
    description: "Set CGPA targets, get notifications, and track your progress toward graduation goals.",
    icon: Trophy,
  },
];

const trustItems = [
  { icon: Lock, title: "Private by Default", description: "Your grades are never public. Only you can see your data." },
  { icon: Eye, title: "No Selling Data", description: "We never sell or share your academic data with third parties." },
  { icon: Trash2, title: "Delete Anytime", description: "Delete your account and all data permanently with one click." },
  { icon: Shield, title: "Secure Storage", description: "Encrypted at rest with Supabase. Your data is protected." },
  { icon: Download, Wifi, title: "Export Your Data", description: "Download all your data as JSON anytime. Full GDPR compliance." },
];

export default function LandingPage() {
  const [showLoading, setShowLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setShowLoading(false);
    }
  }, [shouldReduceMotion]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5 },
  };

  const stagger = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true, margin: "-80px" },
  };

  const childVariant = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <>
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
      <Navbar />
      <main className="relative z-10 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute left-1/2 top-20 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-electric-blue/10 blur-[120px]" />

          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge color="blue" icon={<Sparkles className="h-3 w-3" />} className="mb-6">
                Built for Anna University Students
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl text-balance"
            >
              Track Your{" "}
              <span className="gradient-text animate-gradient">Academic Journey</span>{" "}
              Effortlessly
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 text-balance"
            >
              Upload your grade screenshot, get instant CGPA calculation, arrear tracking,
              semester breakdowns, and personalized academic insights — all in one beautiful app.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Get Started Free
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" leftIcon={<Eye className="h-5 w-5" />}>
                  View Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-green" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-green" />
                Free for students
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-green" />
                Private & secure
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="mx-auto max-w-2xl text-center">
              <Badge color="red" className="mb-4">The Problem</Badge>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Tracking Grades Shouldn&apos;t Be This Hard
              </h2>
              <p className="mt-4 text-gray-400">
                Every Anna University student faces these struggles. It&apos;s time for a better way.
              </p>
            </motion.div>

            <motion.div
              {...stagger}
              className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {problems.map((problem, i) => (
                <motion.div key={i} {...childVariant}>
                  <Card hover className="h-full p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-error-red/10 text-error-red">
                      <problem.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                    <p className="mt-2 text-sm text-gray-400">{problem.description}</p>
                  </Card>
                </motion.div>
              ))}

              {/* CTA card to fill the grid */}
              <motion.div {...childVariant}>
                <Card gradientBorder className="h-full p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-electric-blue/10 text-electric-blue">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">There&apos;s a Better Way</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    AU Track solves all of this and more. Let technology do the heavy lifting.
                  </p>
                  <Link href="/features" className="mt-4 inline-block">
                    <span className="flex items-center gap-1 text-sm font-medium text-electric-blue hover:gap-2 transition-all">
                      Explore Features <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Solution / Features Section */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute left-0 top-1/2 h-[400px] w-[400px] rounded-full bg-royal-indigo/10 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="mx-auto max-w-2xl text-center">
              <Badge color="blue" className="mb-4">The Solution</Badge>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Everything You Need in One App
              </h2>
              <p className="mt-4 text-gray-400">
                Seven powerful features designed specifically for Anna University students.
              </p>
            </motion.div>

            <motion.div
              {...stagger}
              className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div key={i} {...childVariant}>
                  <Card hover className="group h-full p-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${featureColorMap[feature.color].bg} ${featureColorMap[feature.color].text}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-electric-blue opacity-0 transition-opacity group-hover:opacity-100">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...fadeInUp} className="mt-12 text-center">
              <Link href="/features">
                <Button variant="outline" size="lg" rightIcon={<ArrowUpRight className="h-5 w-5" />}>
                  See All Features in Detail
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeInUp} className="mx-auto max-w-2xl text-center">
              <Badge color="indigo" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                From Screenshot to Insights in Minutes
              </h2>
              <p className="mt-4 text-gray-400">
                Four simple steps to transform how you track your academic performance.
              </p>
            </motion.div>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  {i < steps.length - 1 && (
                    <div className="absolute left-full top-12 hidden h-px w-full bg-gradient-to-r from-electric-blue/30 to-transparent lg:block" />
                  )}
                  <Card className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric-blue/20 to-royal-indigo/20 text-electric-blue">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-bold text-electric-blue/60">{step.number}</span>
                    <h3 className="mt-2 text-base font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-400">{step.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Preview / Mock Dashboard */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeInUp} className="mx-auto max-w-2xl text-center">
              <Badge color="green" className="mb-4">Preview</Badge>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Your Dashboard, Reimagined
              </h2>
              <p className="mt-4 text-gray-400">
                A glimpse of what your academic dashboard looks like.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mt-12"
            >
              <Card gradientBorder className="overflow-hidden">
                <div className="p-6 sm:p-8">
                  {/* Mock dashboard header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Welcome back,</p>
                      <h3 className="text-xl font-bold text-white">Student Dashboard</h3>
                    </div>
                    <Badge color="green" icon={<CheckCircle2 className="h-3 w-3" />}>All Clear</Badge>
                  </div>

                  {/* Mock stats */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      { label: "Current CGPA", value: "8.42", icon: TrendingUp, color: "text-electric-blue bg-electric-blue/10" },
                      { label: "Semesters", value: "5", icon: BookOpen, color: "text-royal-indigo bg-royal-indigo/10" },
                      { label: "Arrears", value: "0", icon: AlertTriangle, color: "text-success-green bg-success-green/10" },
                      { label: "Target", value: "9.00", icon: Target, color: "text-amber bg-amber/10" },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-xl border border-navy-600 bg-navy-800/40 p-4">
                        <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-gray-400">{stat.label}</p>
                        <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mock grade table */}
                  <div className="mt-6 overflow-hidden rounded-xl border border-navy-600">
                    <table className="w-full text-sm">
                      <thead className="bg-navy-800/60">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">Subject</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-400">Code</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-400">Credits</th>
                          <th className="px-4 py-3 text-center font-medium text-gray-400">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-700">
                        {[
                          { sub: "Transforms and Partial Differential Equations", code: "MA3251", credits: 4, grade: "A" },
                          { sub: "Data Structures and Algorithms", code: "CS3351", credits: 4, grade: "A+" },
                          { sub: "Operating Systems", code: "CS3491", credits: 3, grade: "B+" },
                          { sub: "Object Oriented Programming", code: "CS3391", credits: 3, grade: "A" },
                        ].map((row, i) => (
                          <tr key={i} className="bg-navy-900/40 hover:bg-navy-800/40 transition-colors">
                            <td className="px-4 py-3 text-gray-300">{row.sub}</td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-400">{row.code}</td>
                            <td className="px-4 py-3 text-center text-gray-300">{row.credits}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge color={row.grade.startsWith("A") ? "green" : "amber"}>{row.grade}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="mt-8 text-center">
              <Link href="/demo">
                <Button variant="ghost" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Explore the Full Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust & Legal */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <motion.div {...fadeInUp} className="mx-auto max-w-2xl text-center">
              <Badge color="indigo" className="mb-4">Privacy First</Badge>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Your Data, Your Control
              </h2>
              <p className="mt-4 text-gray-400">
                We built AU Track with privacy at its core. Here&apos;s our promise to you.
              </p>
            </motion.div>

            <motion.div
              {...stagger}
              className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {trustItems.map((item, i) => (
                <motion.div key={i} {...childVariant}>
                  <Card className="h-full p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success-green/10 text-success-green">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs text-gray-400">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...fadeInUp} className="mt-10">
              <Card className="p-6 text-center">
                <p className="text-sm text-gray-400">
                  AU Track is an independent project and is{" "}
                  <span className="font-semibold text-gray-300">not affiliated with</span>,
                  endorsed by, or officially connected to Anna University.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link href="/privacy">
                    <Button variant="ghost" size="sm" leftIcon={<Shield className="h-4 w-4" />}>
                      Privacy Policy
                    </Button>
                  </Link>
                  <Link href="/terms">
                    <Button variant="ghost" size="sm" leftIcon={<FileText className="h-4 w-4" />}>
                      Terms of Service
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
