"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Star,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useRateLimit } from "@/lib/hooks/useRateLimit";
import { sanitizeInput } from "@/lib/security";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const FEEDBACK_CATEGORIES = [
  { label: "Bug Report", value: "bug" },
  { label: "Feature Request", value: "feature" },
  { label: "General Feedback", value: "general" },
  { label: "UI/UX Suggestion", value: "ui" },
  { label: "Performance Issue", value: "performance" },
  { label: "Other", value: "other" },
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [dismissed] = useLocalStorage("au-track-feedback-dismissed", false);

  const rateLimit = useRateLimit({
    maxActions: 3,
    windowMs: 60 * 60 * 1000, // 3 submissions per hour
    key: "feedback",
  });

  // Don't render if dismissed
  if (dismissed) return null;

  const handleSubmit = useCallback(async () => {
    if (rating === 0 || !message.trim()) return;
    if (!rateLimit.canAct) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const sanitizedMessage = sanitizeInput(message, 5000);

      // Try to save to Supabase
      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        rating,
        category,
        message: sanitizedMessage,
        created_at: new Date().toISOString(),
      });

      if (error) {
        // Fallback: send via API
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            category,
            message: sanitizedMessage,
          }),
        }).catch(() => {});
      }

      rateLimit.recordAction();
      setSubmitted(true);

      // Reset after 2.5s
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
        setRating(0);
        setCategory("general");
        setMessage("");
      }, 2500);
    } catch (err) {
      console.error("[FeedbackWidget] Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }, [rating, message, category, rateLimit]);

  const canSubmit = rating > 0 && message.trim().length > 0 && rateLimit.canAct;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open feedback form"
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-electric-blue to-royal-indigo text-white shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50 transition-shadow"
          >
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-green opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success-green" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative w-full max-w-md rounded-2xl p-6"
            >
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric-blue/10 text-electric-blue">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Send Feedback</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close feedback"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-green/10 text-success-green">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Thank you!</h4>
                  <p className="mt-1 text-sm text-gray-400">
                    Your feedback has been received. We appreciate you helping us improve.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {/* Rating */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      How would you rate your experience?
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          className="rounded-lg p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              "h-7 w-7 transition-colors",
                              (hoverRating || rating) >= star
                                ? "fill-amber text-amber"
                                : "text-gray-600"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-navy-600 bg-navy-800/50 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-electric-blue/50 focus:ring-2 focus:ring-electric-blue/20"
                    >
                      {FEEDBACK_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={5000}
                      placeholder="Tell us what you think..."
                      className="w-full resize-none rounded-xl border border-navy-600 bg-navy-800/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-electric-blue/50 focus:ring-2 focus:ring-electric-blue/20"
                    />
                    <p className="mt-1 text-right text-xs text-gray-600">
                      {message.length}/5000
                    </p>
                  </div>

                  {/* Rate limit warning */}
                  {!rateLimit.canAct && (
                    <p className="text-xs text-amber">
                      Rate limit reached. You can submit feedback again in{" "}
                      {Math.ceil(rateLimit.timeUntilReset / 60000)} minute(s).
                    </p>
                  )}

                  {/* Submit */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    isLoading={submitting}
                    leftIcon={<Send className="h-4 w-4" />}
                    fullWidth
                  >
                    Submit Feedback
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
