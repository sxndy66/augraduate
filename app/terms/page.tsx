"use client";

import { motion } from "framer-motion";
import {
  FileText, AlertTriangle, Shield, Scale, GraduationCap,
  Mail, BookOpen, Ban, CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const sections = [
  {
    id: "acceptance",
    icon: CheckCircle2,
    title: "1. Acceptance of Terms",
    content: [
      "By creating an account or using AU Track in any capacity, you agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you must not use the application.",
      "These terms may be updated periodically. Continued use of AU Track after changes are posted constitutes acceptance of the updated terms. We will notify users of significant changes via email or in-app notification.",
    ],
  },
  {
    id: "usage",
    icon: BookOpen,
    title: "2. Permitted Use",
    content: [
      "AU Track is provided as a free tool for Anna University students and alumni to track their academic performance. You may use it to upload grade data, calculate CGPA/GPA, track arrears, set academic targets, and receive academic notifications.",
      "You agree to provide accurate academic data when using the app. AU Track is a self-reporting tool — you are responsible for the accuracy of the data you input or upload.",
      "You may not use AU Track to misrepresent your academic standing to any institution, employer, or third party.",
    ],
  },
  {
    id: "prohibited",
    icon: Ban,
    title: "3. Prohibited Activities",
    content: [
      "You may not attempt to access, tamper with, or disrupt the service's infrastructure, databases, or authentication systems.",
      "You may not use AU Track to store or process data that is not your own academic record.",
      "You may not reverse engineer, decompile, or attempt to extract source code from the application.",
      "You may not use automated scripts, bots, or scrapers to interact with the service without explicit permission.",
    ],
  },
  {
    id: "disclaimer",
    icon: AlertTriangle,
    title: "4. Disclaimer of Accuracy",
    content: [
      "AU Track provides CGPA and GPA calculations based on the data you input and the Anna University grading system (10-point scale). While we strive for accuracy in our calculations, we do not guarantee that the results will match your official university records.",
      "OCR-based grade extraction may produce errors. Always review extracted data before saving it. AU Track is not responsible for academic decisions made based on incorrectly extracted or input data.",
      "Always verify your official CGPA, grades, and academic standing through Anna University's official channels. AU Track is a supplementary tracking tool, not an official source of academic records.",
    ],
  },
  {
    id: "non-affiliation",
    icon: GraduationCap,
    title: "5. Non-Affiliation with Anna University",
    content: [
      "AU Track is an independent, student-built project. It is not affiliated with, endorsed by, sponsored by, or officially connected to Anna University, its affiliated colleges, or any educational institution.",
      "AU Track does not access, retrieve, or sync data from Anna University's official systems, websites, or portals. All data in AU Track is self-reported by the user.",
      "The name 'Anna University' and any related marks are property of their respective owners. AU Track uses the name solely to describe the compatibility of its features with Anna University's grading system.",
    ],
  },
  {
    id: "liability",
    icon: Scale,
    title: "6. Limitation of Liability",
    content: [
      "AU Track is provided 'as is' and 'as available' without warranties of any kind, express or implied, including but not limited to accuracy, reliability, or fitness for a particular purpose.",
      "To the maximum extent permitted by law, the creator of AU Track (Santhosh V) shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from the use of or inability to use the application.",
      "This includes, but is not limited to, academic decisions, career decisions, or any outcomes resulting from reliance on CGPA/GPA calculations or academic data displayed in the app.",
      "You use AU Track at your own risk and are solely responsible for any decisions made based on the information provided by the app.",
    ],
  },
  {
    id: "data-responsibility",
    icon: Shield,
    title: "7. Data Responsibility",
    content: [
      "You are responsible for the accuracy of all academic data you input or upload to AU Track.",
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You may delete your data and account at any time. See our Privacy Policy for details on data handling and deletion.",
    ],
  },
  {
    id: "changes",
    icon: FileText,
    title: "8. Changes to the Service",
    content: [
      "AU Track is a continuously evolving project. Features may be added, modified, or removed at any time without prior notice.",
      "The service may experience downtime for maintenance or updates. We are not liable for any inconvenience caused by service unavailability.",
      "AU Track is currently a free service. We reserve the right to introduce paid features in the future, though core tracking features will remain free for students.",
    ],
  },
];

export default function TermsPage() {
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
          <div className="absolute left-1/2 top-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-royal-indigo/10 blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-royal-indigo/10 text-royal-indigo">
              <FileText className="h-8 w-8" />
            </div>
            <Badge color="indigo" className="mb-4">Terms of Service</Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 text-balance">
              Please read these terms carefully before using AU Track. By using the app,
              you agree to the terms outlined below.
            </p>
            <p className="mt-4 text-sm text-gray-500">Last updated: June 2026</p>
          </motion.div>
        </section>

        {/* Key Notice */}
        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="mx-auto max-w-4xl">
            <Card className="border-amber/20 bg-amber/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Important Notice</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    AU Track is an independent, student-built project. It is{" "}
                    <span className="font-semibold text-gray-300">not affiliated with</span>{" "}
                    Anna University. Academic data is self-reported and should always be
                    verified through official university channels.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* Terms Sections */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.id}
                id={section.id}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.04 }}
              >
                <Card className="p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-royal-indigo/10 text-royal-indigo">
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
              <Mail className="mx-auto h-8 w-8 text-royal-indigo" />
              <h2 className="mt-4 text-xl font-bold text-white">Questions About These Terms?</h2>
              <p className="mt-2 text-sm text-gray-400">
                If you have any questions or need clarification about these Terms of Service,
                feel free to reach out.
              </p>
              <a
                href="mailto:santhosh023166@gmail.com"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-royal-indigo hover:gap-3 transition-all"
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
