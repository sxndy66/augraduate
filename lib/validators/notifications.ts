import { z } from "zod";

export const NOTIFICATION_CATEGORIES = [
  "academic",
  "exam",
  "result",
  "attendance",
  "event",
  "deadline",
  "announcement",
  "system",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const notificationFilterSchema = z.object({
  category: z
    .enum(NOTIFICATION_CATEGORIES)
    .optional()
    .or(z.literal("all")),
  isRead: z.boolean().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  category: z.enum(NOTIFICATION_CATEGORIES),
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
});

export type NotificationFilter = z.infer<typeof notificationFilterSchema>;
export type Notification = z.infer<typeof notificationSchema>;

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  academic: "Academic",
  exam: "Examination",
  result: "Results",
  attendance: "Attendance",
  event: "Events",
  deadline: "Deadlines",
  announcement: "Announcements",
  system: "System",
};

export const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  academic: "royal-indigo",
  exam: "error-red",
  result: "success-green",
  attendance: "amber",
  event: "electric-blue",
  deadline: "error-red",
  announcement: "royal-indigo",
  system: "navy",
};
