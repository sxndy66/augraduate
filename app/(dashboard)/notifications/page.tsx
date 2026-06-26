"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  title: string;
  body: string;
  url: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchNotifs(); }, []);

  async function fetchNotifs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("au_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifs(data as Notification[]);
    }
    setLoading(false);
  }

  async function markRead(id: string) {
    await supabase.from("au_notifications").update({ is_read: true }).eq("id", id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#E8E8F0] font-[family-name:var(--font-display)]">
          AU Alerts
        </h1>
        <span className="text-xs text-[#6B6B80] bg-[#1A1A26] px-3 py-1.5 rounded-lg border border-[#2A2A3D]">
          {notifs.filter((n) => !n.is_read).length} unread
        </span>
      </div>

      {notifs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1A1A26] border border-[#2A2A3D] flex items-center justify-center mb-4">
            <svg width="24" height="24" fill="none" stroke="#6B6B80" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <p className="text-[#E8E8F0] font-medium mb-1">No notifications</p>
          <p className="text-[#6B6B80] text-sm">Alerts from Anna University will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start gap-4 transition-colors ${
                n.is_read ? "border-[#2A2A3D] opacity-70" : "border-[#6C63FF]/30"
              }`}
            >
              <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${n.is_read ? "bg-[#2A2A3D]" : "bg-[#6C63FF]"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-medium ${n.is_read ? "text-[#6B6B80]" : "text-[#E8E8F0]"}`}>
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-[#6B6B80] shrink-0">
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${n.is_read ? "text-[#6B6B80]" : "text-[#E8E8F0]"}`}>
                  {n.body}
                </p>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-[#6C63FF] hover:underline mt-2"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
