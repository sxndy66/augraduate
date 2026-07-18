"use client";

import { motion } from "framer-motion";
import {
  Shield, Eye, Lock, Trash2, ScanLine, Database, Mail,
  CheckCircle2, XCircle, FileText, Server, UserCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const sections = [
  {
    id: "data-collection",
    icon: Database,
    title: "Data We Collect",
    content: [
      "When you create an AU Track account, we collect your email address and any profile information you choose to provide, such as your name, department, and current semester.",
      "We collect academic data that you voluntarily input or upload, including subject codes, grades, credit points, GPA and CGPA values, arrear information, and target CGPA goals.",
      "We do not collect any data automatically from your device beyond what is necessary for the app to function (such as authentication tokens and session cookies).",
    ],
  },
  {
    id: "screenshot-uploads",
    icon: ScanLine,
    title: "Screenshot Uploads",
    content: [
      "When you upload a grade sheet screenshot for OCR processing, the image is processed locally in your browser using Tesseract.js, an in-browser OCR engine.",
      "Your uploaded screenshots are not permanently stored on our servers unless you explicitly choose to save them. Unsaved screenshots are discarded after processing.",
      "If you choose to save a screenshot, it is stored securely in Supabase Storage linked to your account and can be deleted at any time.",
    ],
  },
  {
    id: "ocr-processing",
    icon: Eye,
    title: "OCR Processing",
    content: [
      "OCR (Optical Character Recognition) processing runs client-side in your browser. Your grade sheet images are not sent to any third-party OCR API.",
      "The extracted data (subject codes, grades, credits) is presented to you for review before anything is saved. You have full control over what gets stored.",
      "We do not use your uploaded images to train any machine learning models.",
    ],
  },
  {
    id: "data-storage",
    icon: Server,
    title: "Data Storage & Security",
    content: [
      "Your data is stored in Supabase, a secure PostgreSQL-based platform with encryption at rest and in transit (TLS/SSL).",
      "Row-level security (RLS) policies ensure that you can only access your own data. No other user or administrator can view your academic records.",
      "Authentication is handled through Supabase Auth, which uses secure JWT-based sessions and supports email/password and OAuth providers.",
    ],
  },
  {
    id: "data-usage",
    icon: UserCheck,
    title: "How We Use Your Data",
    content: [
      "Your academic data is used solely to provide you with CGPA calculations, GPA tracking, arrear management, target planning, and academic insights.",
      "We use your email address to send you account-related notifications (such as password resets) and academic reminders that you have opted into.",
      "We do not use your data for advertising, marketing, or any commercial purpose beyond providing the AU Track service.",
    ],
  },
  {
    id: "no-selling",
    icon: XCircle,
    title: "We Never Sell Your Data",
    content: [
      "AU Track does not sell, rent, or lease your personal or academic data to any third party — ever.",
      "We do not share your data with advertisers, data brokers, or analytics companies.",
      "We do not use third-party tracking pixels or advertising SDKs in our application.",
    ],
  },
  {
    id: "no-public-grades",
    icon: Lock,
    title: "Your Grades Are Private",
    content: [
      "Your academic data is strictly private. No other user can see your grades, CGPA, arrears, or any academic information.",
      "There is no public profile, leaderboard, or sharing feature that exposes your grades to others.",
      "Only you can view and access your academic data, protected by your authentication credentials.",
    ],
  },
  {
    id: "delete-options",
    icon: Trash2,
    title: "Deleting Your Data",
    content: [
      "You can delete individual academic records (semesters, subjects, arrears) at any time from within the app.",
      "You can delete your entire account and all associated data permanently from the Settings page. This action is irreversible.",
      "Upon account deletion, all your academic data, uploaded screenshots, profile information, and authentication records are permanently removed from our database and storage.",
      "To request manual data deletion, you can also contact us at santhosh023166@gmail.com.",
    ],
  },
  {
    id: "non-affiliation",
    icon: FileText,
    title: "Non-Affiliation Disclaimer",
    content: [
      "AU Track is an independent, student-built project. It is not affiliated with, endorsed by, sponsored by, or officially connected to Anna University or any of its affiliated institutions.",
      "AU Track does not access, retrieve, or sync data from Anna University's official systems. All academic data in AU Track is self-reported by the user.",
      "Always verify your official results, grades, and academic standing through Anna University's official channels.",
    ],
  },
];

const promises = [
  { icon: CheckCircle2, text: "We never sell your data" },
  { icon: CheckCircle2, text: "Your grades are never public" },
  { icon: CheckCircle2, text: "OCR runs in your browser" },
  { icon: CheckCircle2, text: "Delete your data anytime" },
  { icon: XCircle, text: "No third-party tracking" },
  { icon: XCircle, text: "No advertising SDKs" },
];

export default function PrivacyPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.4 },
  };

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute left-1/2 top-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-success-green/10 blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-green/10 text-success-green">
              <Shield className="h-8 w-8" />
            </div>
            <Badge color="green" className="mb-4">Privacy Policy</Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Your Privacy <span className="gradient-text">Matters</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 text-balance">
              We built AU Track with privacy as a foundational principle. This policy
              explains exactly what data we collect, how we use it, and the control you have.
            </p>
            <p className="mt-4 text-sm text-gray-500">Last updated: June 2026</p>
          </motion.div>
        </section>

        {/* Promises */}
        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <motion.div
            {...fadeInUp}
            className="mx-auto max-w-4xl"
          >
            <Card className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promises.map((promise, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <promise.icon className={`h-5 w-5 shrink-0 ${promise.icon === CheckCircle2 ? "text-success-green" : "text-error-red"}`} />
                    <span className="text-sm text-gray-300">{promise.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Policy Sections */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.id}
                id={section.id}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.05 }}
              >
                <Card className="p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-electric-blue/10 text-electric-blue">
                      <section.icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                  </div>
                  <div className="mt-4 space-y-3">
                    {section.content.map((para, j) => (
                      <p key={j} className="text-sm leading-relaxed text-gray-400">
                        {para}
                      </p>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="mx-auto max-w-3xl">
            <Card gradientBorder className="p-8 text-center">
              <Mail className="mx-auto h-8 w-8 text-electric-blue" />
              <h2 className="mt-4 text-xl font-bold text-white">Questions About Privacy?</h2>
              <p className="mt-2 text-sm text-gray-400">
                If you have any questions or concerns about how we handle your data,
                we&apos;re happy to help.
              </p>
              <a
                href="mailto:santhosh023166@gmail.com"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-electric-blue hover:gap-3 transition-all"
              >
                <Mail className="h-4 w-4" />
                santhosh023166@gmail.com
              </a>
            </Card>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
}
