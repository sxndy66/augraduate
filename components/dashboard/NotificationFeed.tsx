import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import {
  Bell,
  ArrowRight,
  Calendar,
  BookOpen,
  AlertCircle,
  Info,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "exam" | "result" | "reminder" | "info" | "alert";
  date: string;
  is_read: boolean;
}

interface NotificationFeedProps {
  notifications: NotificationItem[];
}

const typeConfig = {
  exam: { icon: <Calendar className="h-4 w-4" />, color: "blue" as const },
  result: { icon: <BookOpen className="h-4 w-4" />, color: "green" as const },
  reminder: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "amber" as const,
  },
  info: { icon: <Info className="h-4 w-4" />, color: "indigo" as const },
  alert: { icon: <AlertCircle className="h-4 w-4" />, color: "red" as const },
};

export function NotificationFeed({ notifications }: NotificationFeedProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-electric-blue" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>
        <Link
          href="/notifications"
          className="flex items-center gap-1 text-sm font-medium text-electric-blue hover:text-electric-blue/80"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No notifications"
          description="You're all caught up! No new notifications."
        />
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notif) => {
            const config = typeConfig[notif.type] ?? typeConfig.info;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  notif.is_read
                    ? "border-navy-600 bg-navy-800/30"
                    : "border-electric-blue/20 bg-electric-blue/5"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-${config.color === "green" ? "success-green" : config.color === "amber" ? "amber" : config.color === "red" ? "error-red" : config.color === "indigo" ? "royal-indigo" : "electric-blue"}/10 text-${config.color === "green" ? "success-green" : config.color === "amber" ? "amber" : config.color === "red" ? "error-red" : config.color === "indigo" ? "royal-indigo" : "electric-blue"}`}
                >
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-white">
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-electric-blue" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
                    {notif.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(notif.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}