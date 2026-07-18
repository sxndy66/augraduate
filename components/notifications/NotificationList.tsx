"use client";

import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationCard, type NotificationItem } from "./NotificationCard";

export interface NotificationListProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onSave: (id: string) => void;
  onMuteCategory: (category: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function NotificationList({
  notifications,
  onMarkRead,
  onSave,
  onMuteCategory,
  isLoading = false,
  className,
}: NotificationListProps) {
  const handleMarkAllRead = useCallback(() => {
    notifications.forEach((n) => {
      if (!n.is_read) onMarkRead(n.id);
    });
  }, [notifications, onMarkRead]);

  if (notifications.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={<BellOff className="h-8 w-8" />}
        title="No notifications found"
        description="Try adjusting your filters or check back later for new updates from Anna University."
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      {/* Header with mark all read */}
      {notifications.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-electric-blue" />
            <h2 className="text-base font-semibold text-white">
              {notifications.length} Notification{notifications.length !== 1 ? "s" : ""}
            </h2>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-electric-blue hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              onSave={onSave}
              onMuteCategory={onMuteCategory}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}