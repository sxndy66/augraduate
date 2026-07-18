"use client"

export const dynamic = 'force-dynamic';;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Github, MessageSquare, Send, User, AlertCircle,
  CheckCircle2, Info, MapPin,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address";
    }
    if (!form.message.trim()) {
      e.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      e.message = "Message must be at least 10 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call — replace with real endpoint when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        type: "success",
        title: "Message sent!",
        message: "Thanks for reaching out. I'll get back to you soon.",
      });
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast({
        type: "error",
        title: "Failed to send",
        message: "Something went wrong. Please try emailing directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="absolute left-1/2 top-10 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-electric-blue/10 blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-electric-blue/10 text-electric-blue">
              <MessageSquare className="h-8 w-8" />
            </div>
            <Badge color="blue" className="mb-4">Get in Touch</Badge>
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              Contact <span className="gradient-text">AU Track</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 text-balance">
              Have a question, suggestion, or found a bug? I&apos;d love to hear from you.
              Fill out the form below or reach out directly.
            </p>
          </motion.div>
        </section>

        {/* Contact Form + Social Links */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Form */}
            <motion.div {...fadeInUp} className="lg:col-span-3">
              <Card gradientBorder className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white">Send a Message</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Fill out the form and I&apos;ll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <Input
                    label="Your Name"
                    placeholder="John Doe"
                    leftIcon={<User className="h-4 w-4" />}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={errors.name}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                  />
                  <div className="w-full">
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium text-gray-200"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Tell me what's on your mind..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`w-full rounded-xl border bg-navy-800/50 px-4 py-2.5 text-white placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-electric-blue/40 focus:border-electric-blue/50 ${
                        errors.message
                          ? "border-error-red/50 focus:ring-error-red/40 focus:border-error-red"
                          : "border-navy-600"
                      }`}
                      aria-invalid={!!errors.message}
                    />
                    <AnimatePresence mode="wait">
                      {errors.message && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1.5 flex items-center gap-1.5 text-sm text-error-red"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          {errors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    rightIcon={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Social Links + Info */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Direct Contact */}
              <Card className="p-6">
                <h3 className="text-sm font-semibold text-gray-400">Direct Contact</h3>
                <div className="mt-4 space-y-3">
                  <a
                    href="mailto:santhosh023166@gmail.com"
                    className="flex items-center gap-3 rounded-xl border border-navy-600 bg-navy-800/40 p-4 transition-all hover:border-electric-blue/40 hover:bg-navy-800/60"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-blue/10 text-electric-blue">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Email</p>
                      <p className="text-xs text-gray-400">santhosh023166@gmail.com</p>
                    </div>
                  </a>
                  <a
                    href="https://github.com/santhosh023166"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-navy-600 bg-navy-800/40 p-4 transition-all hover:border-electric-blue/40 hover:bg-navy-800/60"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal-indigo/10 text-royal-indigo">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">GitHub</p>
                      <p className="text-xs text-gray-400">@santhosh023166</p>
                    </div>
                  </a>
                </div>
              </Card>

              {/* Response Time */}
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-green/10 text-success-green">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Response Time</p>
                    <p className="text-xs text-gray-400">Usually within 24–48 hours</p>
                  </div>
                </div>
              </Card>

              {/* Non-Affiliation Notice */}
              <Card className="border-amber/20 bg-amber/5 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Non-Affiliation Notice</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">
                      AU Track is an independent project and is not affiliated with,
                      endorsed by, or officially connected to Anna University. For official
                      university matters, please contact Anna University directly.
                    </p>
                  </div>
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
