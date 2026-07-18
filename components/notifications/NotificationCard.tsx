"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Check,
  BellOff,
  Clock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: string;
  category_label: string;
  category_color: "blue" | "indigo" | "green" | "amber" | "red" | "gray";
  source_url: string | null;
  source_name: string | null;
  published_date: string;
  fetched_date: string;
  is_read: boolean;
  is_saved: boolean;
  is_muted: boolean;
}

export interface NotificationCardProps {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onSave: (id: string) => void;
  onMuteCategory: (category: string) => void;
  className?: string;
}

const CATEGORY_BADGE_COLOR: Record<string, "blue" | "indigo" | "green" | "amber" | "red" | "gray"> = {
  exam_timetable: "red",
  results: "green",
  revaluation: "amber",
  hall_ticket: "blue",
  practical_exam: "indigo",
  internal_assessment: "amber",
  academic_calendar: "indigo",
  circulars: "gray",
};

export function NotificationCard({
  notification,
  onMarkRead,
  onSave,
  onMuteCategory,
  className,
}: NotificationCardProps) {
  const handleMarkRead = useCallback(() => {
    if (!notification.is_read) onMarkRead(notification.id);
  }, [notification.is_read, notification.id, onMarkRead]);

  const handleSave = useCallback(() => {
    onSave(notification.id);
  }, [notification.id, onSave]);

  const handleMute = useCallback(() => {
    onMuteCategory(notification.category);
  }, [notification.category, onMuteCategory]);

  const badgeColor =
    CATEGORY_BADGE_COLOR[notification.category] ?? notification.category_color ?? "gray";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "p-4 transition-all",
          notification.is_read ? "opacity-75" : "border-electric-blue/30",
          notification.is_muted && "opacity-50",
          className
        )}
      >
        <div className="flex items-start gap-3">
          {/* Unread indicator */}
          <div className="mt-1.5 shrink-0">
            {notification.is_read ? (
              <div className="h-2 w-2 rounded-full bg-navy-600" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-electric-blue shadow-glow shadow-electric-blue/50" />
            )}
          </div>

          <div className="flex-1 space-y-2">
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color={badgeColor}>{notification.category_label}</Badge>
                {notification.is_muted && (
                  <Badge color="gray" icon={<BellOff className="h-3 w-3" />}>
                    Muted
                  </Badge>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDate(notification.published_date, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Title */}
            <h3
              className={cn(
                "text-sm font-semibold text-white",
                notification.is_read && "font-normal text-gray-300"
              )}
            >
              {notification.title}
            </h3>

            {/* Body */}
            <p className="text-sm text-gray-400 line-clamp-3">{notification.body}</p>

            {/* Source link */}
            {notification.source_url && (
              <a
                href={notification.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-electric-blue hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {notification.source_name || "View source"}
              </a>
            )}

            {/* Fetched date */}
            <p className="text-xs text-gray-600">
              Fetched on {formatDate(notification.fetched_date)}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkRead}
                  leftIcon={<Check className="h-3.5 w-3.5" />}
                  className="!px-2 !py-1 !text-xs"
                >
                  Mark Read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                leftIcon={
                  notification.is_saved ? (
                    <BookmarkCheck className="h-3.5 w-3.5 text-success-green" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )
                }
                className="!px-2 !py-1 !text-xs"
              >
                {notification.is_saved ? "Saved" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMute}
                leftIcon={
                  notification.is_muted ? (
                    <VolumeX className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )
                }
                className="!px-2 !py-1 !text-xs"
              >
                Mute {notification.category_label}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}