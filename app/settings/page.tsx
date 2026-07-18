"use client"

export const dynamic = 'force-dynamic';;

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Bell,
  Database,
  AlertTriangle,
  Save,
  Trash2,
  Download,
  Upload,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  Palette,
  Sun,
  Moon,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { LightDarkToggle } from "@/components/ui/LightDarkToggle";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  degree: string;
  regulation: string;
  branch: string;
  current_semester: number;
  target_cgpa: number;
  total_credits: number;
}

interface NotificationPrefs {
  mute_all: boolean;
  allowed_categories: string[];
  degree_filter: string;
  branch_filter: string;
}

// ─── Constants ───────────────────────────────────────────

const DEGREES = [
  { label: "B.E. — Bachelor of Engineering", value: "B.E." },
  { label: "B.Tech — Bachelor of Technology", value: "B.Tech" },
  { label: "M.E. — Master of Engineering", value: "M.E." },
  { label: "M.Tech — Master of Technology", value: "M.Tech" },
  { label: "MCA — Master of Computer Applications", value: "MCA" },
  { label: "MBA — Master of Business Administration", value: "MBA" },
];

const REGULATIONS = [
  { label: "R2021 (2021 Regulations)", value: "R2021" },
  { label: "R2018 (2018 Regulations)", value: "R2018" },
  { label: "R2017 (2017 Regulations)", value: "R2017" },
  { label: "R2013 (2013 Regulations)", value: "R2013" },
];

const BRANCHES = [
  { label: "Artificial Intelligence & Data Science", value: "AIDS" },
  { label: "Computer Science & Engineering", value: "CSE" },
  { label: "Information Technology", value: "IT" },
  { label: "Electronics & Communication Engineering", value: "ECE" },
  { label: "Electrical & Electronics Engineering", value: "EEE" },
  { label: "Mechanical Engineering", value: "MECH" },
  { label: "Civil Engineering", value: "CIVIL" },
  { label: "Mechatronics Engineering", value: "MECATRONICS" },
  { label: "Biomedical Engineering", value: "BME" },
  { label: "Aeronautical Engineering", value: "AERO" },
];

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
  label: `Semester ${i + 1}`,
  value: String(i + 1),
}));

const NOTIFICATION_CATEGORIES = [
  { key: "exam", label: "Exam Schedules" },
  { key: "result", label: "Result Announcements" },
  { key: "reminder", label: "Study Reminders" },
  { key: "info", label: "General Info" },
  { key: "alert", label: "Arrear Alerts" },
];

// ─── Page Component ──────────────────────────────────────

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    mute_all: false,
    allowed_categories: ["exam", "result", "reminder", "info", "alert"],
    degree_filter: "",
    branch_filter: "",
  });

  // Editable form state
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [degree, setDegree] = useState("");
  const [regulation, setRegulation] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [targetCgpa, setTargetCgpa] = useState("");
  const [totalCredits, setTotalCredits] = useState("");

  // Saving states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [deletingGrades, setDeletingGrades] = useState(false);
  const [deletingAllData, setDeletingAllData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<
    "delete-grades" | "delete-data" | "delete-account" | null
  >(null);
  const [deletePassword, setDeletePassword] = useState("");

  // ─── Fetch profile ────────────────────────────────────

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to view settings.");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, degree, regulation, branch, current_semester, target_cgpa, total_credits")
        .eq("id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      const p: Profile = data ?? {
        id: user.id,
        full_name: user.email?.split("@")[0] ?? "Student",
        avatar_url: null,
        degree: "B.E.",
        regulation: "R2021",
        branch: "AIDS",
        current_semester: 1,
        target_cgpa: 8.5,
        total_credits: 160,
      };

      setProfile(p);
      setName(p.full_name);
      setAvatarUrl(p.avatar_url);
      setDegree(p.degree || "B.E.");
      setRegulation(p.regulation || "R2021");
      setBranch(p.branch || "AIDS");
      setSemester(String(p.current_semester || 1));
      setTargetCgpa(String(p.target_cgpa || 8.5));
      setTotalCredits(String(p.total_credits || 160));

      // Fetch notification prefs (stored in a separate table or metadata)
      const { data: notifData } = await supabase
        .from("notification_preferences")
        .select("mute_all, allowed_categories, degree_filter, branch_filter")
        .eq("user_id", user.id)
        .single();

      if (notifData) {
        setNotifPrefs(notifData as NotificationPrefs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ─── Save handlers ────────────────────────────────────

  async function handleSaveProfile() {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          avatar_url: avatarUrl,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      toast({ type: "success", title: "Profile updated", message: "Your profile has been saved." });
      setProfile((prev) => (prev ? { ...prev, full_name: name.trim(), avatar_url: avatarUrl } : prev));
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save profile",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveAcademic() {
    if (!profile) return;
    setSavingAcademic(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          degree,
          regulation,
          branch,
          current_semester: parseInt(semester, 10),
          target_cgpa: parseFloat(targetCgpa) || 0,
          total_credits: parseInt(totalCredits, 10) || 0,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      toast({ type: "success", title: "Academic settings saved" });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              degree,
              regulation,
              branch,
              current_semester: parseInt(semester, 10),
              target_cgpa: parseFloat(targetCgpa) || 0,
              total_credits: parseInt(totalCredits, 10) || 0,
            }
          : prev
      );
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save academic settings",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSavingAcademic(false);
    }
  }

  async function handleSaveNotifs() {
    if (!profile) return;
    setSavingNotifs(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: profile.id,
          mute_all: notifPrefs.mute_all,
          allowed_categories: notifPrefs.allowed_categories,
          degree_filter: notifPrefs.degree_filter,
          branch_filter: notifPrefs.branch_filter,
        });

      if (updateError) throw updateError;

      toast({ type: "success", title: "Notification preferences saved" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save preferences",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSavingNotifs(false);
    }
  }

  // ─── Data management ──────────────────────────────────

  async function handleDeleteGrades() {
    if (!profile) return;
    setDeletingGrades(true);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("user_grades")
        .delete()
        .eq("user_id", profile.id);

      if (deleteError) throw deleteError;

      toast({ type: "success", title: "All grades deleted", message: "Your grade history has been cleared." });
      setConfirmAction(null);
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete grades",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setDeletingGrades(false);
    }
  }

  async function handleDeleteAllData() {
    if (!profile) return;
    setDeletingAllData(true);
    try {
      const supabase = createClient();
      const userId = profile.id;

      // Delete from all user-data tables
      const tables = ["user_grades", "arrears", "notes", "notifications", "target_plans", "notification_preferences"];
      const results = await Promise.all(
        tables.map((table) =>
          supabase.from(table).delete().eq("user_id", userId)
        )
      );

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to delete from ${errors.length} table(s).`);
      }

      toast({ type: "success", title: "All data deleted", message: "Your academic data has been cleared." });
      setConfirmAction(null);
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete data",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setDeletingAllData(false);
    }
  }

  async function handleExportData() {
    if (!profile) return;
    setExportingData(true);
    try {
      const response = await fetch("/api/export-data", { method: "GET" });

      if (response.status === 429) {
        const data = await response.json();
        toast({
          type: "warning",
          title: "Rate limited",
          message: data.message || "Please wait before exporting again.",
        });
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split('filename="')[1]?.replace('"', "")
        : `au-track-export-${new Date().toISOString().split("T")[0]}.json`;
      a.download = filename || `au-track-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ type: "success", title: "Data exported", message: "Your data has been downloaded as JSON." });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to export data",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setExportingData(false);
    }
  }

  async function handleDeleteAccount() {
    if (!profile) return;
    if (!deletePassword) {
      toast({ type: "error", title: "Password required", message: "Please enter your password to confirm." });
      return;
    }
    setDeletingAccount(true);
    try {
      const response = await fetch("/api/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (response.status === 429) {
        toast({
          type: "warning",
          title: "Rate limited",
          message: data.message || "Too many attempts. Please try again later.",
        });
        return;
      }

      if (response.status === 403) {
        toast({ type: "error", title: "Wrong password", message: data.message || "Password verification failed." });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Account deletion failed");
      }

      // Sign out client-side
      const supabase = createClient();
      await supabase.auth.signOut();

      toast({ type: "success", title: "Account deleted", message: "Redirecting to login..." });
      setConfirmAction(null);
      setDeletePassword("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to delete account",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setDeletingAccount(false);
    }
  }

  // ─── Notification category toggle ─────────────────────

  function toggleCategory(key: string) {
    setNotifPrefs((prev) => {
      const categories = prev.allowed_categories.includes(key)
        ? prev.allowed_categories.filter((c) => c !== key)
        : [...prev.allowed_categories, key];
      return { ...prev, allowed_categories: categories };
    });
  }

  // ─── Render ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="flex items-center justify-center py-20">
          <Spinner size="lg" label="Loading settings..." />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState title="Failed to load settings" message={error} onRetry={fetchProfile} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your profile, academic details, notifications, and data.
        </p>
      </div>

      <div className="space-y-6">
        {/* ─── Profile Settings ─────────────────────────── */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric-blue/10 text-electric-blue">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-electric-blue to-royal-indigo text-2xl font-bold text-white">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(name)
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 border-2 border-navy-900 text-gray-300 hover:text-white transition-colors"
                  title="Change avatar (enter URL)"
                  onClick={() => {
                    const url = window.prompt("Enter avatar image URL:");
                    if (url !== null) setAvatarUrl(url || null);
                  }}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              {avatarUrl && (
                <button
                  onClick={() => setAvatarUrl(null)}
                  className="text-xs text-gray-500 hover:text-error-red transition-colors"
                >
                  Remove avatar
                </button>
              )}
            </div>

            {/* Name */}
            <div className="flex-1 space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
              <Button
                onClick={handleSaveProfile}
                isLoading={savingProfile}
                leftIcon={<Save className="h-4 w-4" />}
                size="sm"
              >
                Save Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* ─── Academic Settings ────────────────────────── */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal-indigo/10 text-royal-indigo">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Academic Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Degree"
                options={DEGREES}
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
              <Select
                label="Regulation"
                options={REGULATIONS}
                value={regulation}
                onChange={(e) => setRegulation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Branch"
                options={BRANCHES}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
              <Select
                label="Current Semester"
                options={SEMESTER_OPTIONS}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Target CGPA"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(e.target.value)}
                placeholder="e.g. 8.50"
              />
              <Input
                label="Total Credits"
                type="number"
                min="0"
                value={totalCredits}
                onChange={(e) => setTotalCredits(e.target.value)}
                placeholder="e.g. 160"
              />
            </div>

            <Button
              onClick={handleSaveAcademic}
              isLoading={savingAcademic}
              leftIcon={<Save className="h-4 w-4" />}
              size="sm"
            >
              Save Academic Settings
            </Button>
          </div>
        </Card>

        {/* ─── Notification Preferences ─────────────────── */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber/10 text-amber">
              <Bell className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Mute All */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-navy-800/50 px-4 py-3 select-none">
              <div>
                <span className="text-sm font-medium text-white">Mute All Notifications</span>
                <p className="text-xs text-gray-500">Disable all push and in-app notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.mute_all}
                onChange={(e) =>
                  setNotifPrefs((prev) => ({ ...prev, mute_all: e.target.checked }))
                }
                className="h-5 w-5 rounded border-navy-600 bg-navy-800 text-electric-blue focus:ring-electric-blue/40"
              />
            </label>

            {/* Allowed Categories */}
            <div className={cn("transition-opacity", notifPrefs.mute_all && "opacity-40 pointer-events-none")}>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Allowed Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {NOTIFICATION_CATEGORIES.map((cat) => {
                  const isActive = notifPrefs.allowed_categories.includes(cat.key);
                  return (
                    <button
                      key={cat.key}
                      onClick={() => toggleCategory(cat.key)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "border-electric-blue/40 bg-electric-blue/10 text-electric-blue"
                          : "border-navy-600 text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {isActive ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", notifPrefs.mute_all && "opacity-40 pointer-events-none")}>
              <Select
                label="Degree Filter"
                options={[
                  { label: "All degrees", value: "" },
                  ...DEGREES,
                ]}
                value={notifPrefs.degree_filter}
                onChange={(e) =>
                  setNotifPrefs((prev) => ({ ...prev, degree_filter: e.target.value }))
                }
                hint="Only show notifications for this degree"
              />
              <Select
                label="Branch Filter"
                options={[
                  { label: "All branches", value: "" },
                  ...BRANCHES,
                ]}
                value={notifPrefs.branch_filter}
                onChange={(e) =>
                  setNotifPrefs((prev) => ({ ...prev, branch_filter: e.target.value }))
                }
                hint="Only show notifications for this branch"
              />
            </div>

            <Button
              onClick={handleSaveNotifs}
              isLoading={savingNotifs}
              leftIcon={<Save className="h-4 w-4" />}
              size="sm"
            >
              Save Preferences
            </Button>
          </div>
        </Card>

        {/* ─── Data Management ──────────────────────────── */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric-blue/10 text-electric-blue">
              <Database className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Data Management</h2>
          </div>

          <div className="space-y-3">
            {/* Export Data */}
            <div className="flex flex-col gap-3 rounded-xl bg-navy-800/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Export Your Data</p>
                <p className="text-xs text-gray-500">Download all your data as a JSON file</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                isLoading={exportingData}
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExportData}
              >
                Export Data
              </Button>
            </div>

            {/* Delete All Grades */}
            <div className="flex flex-col gap-3 rounded-xl bg-navy-800/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete All Grades</p>
                <p className="text-xs text-gray-500">Remove your entire grade history</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setConfirmAction("delete-grades")}
              >
                Delete Grades
              </Button>
            </div>

            {/* Delete All Data */}
            <div className="flex flex-col gap-3 rounded-xl bg-navy-800/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Delete All Data</p>
                <p className="text-xs text-gray-500">Remove grades, arrears, notes, and plans</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setConfirmAction("delete-data")}
              >
                Delete All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* ─── Danger Zone ──────────────────────────────── */}
        <Card className="border-error-red/20 p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-error-red/10 text-error-red">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-error-red/20 bg-error-red/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">Delete Account</p>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmAction("delete-account")}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* ─── Confirmation Dialog ────────────────────────── */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-2xl p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-red/10 text-error-red">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {confirmAction === "delete-grades" && "Delete All Grades?"}
                    {confirmAction === "delete-data" && "Delete All Data?"}
                    {confirmAction === "delete-account" && "Delete Account?"}
                  </h3>
                </div>
              </div>

              <p className="mb-4 text-sm text-gray-400">
                {confirmAction === "delete-grades" &&
                  "This will permanently remove all your grade records. This action cannot be undone."}
                {confirmAction === "delete-data" &&
                  "This will permanently remove all your grades, arrears, notes, target plans, and notification preferences. This action cannot be undone."}
                {confirmAction === "delete-account" &&
                  "This will permanently delete your account and all associated data. You will be signed out and redirected to the login page. This action cannot be undone."}
              </p>

              {confirmAction === "delete-account" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-200">
                    Confirm your password
                  </label>
                  <Input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-4 w-4" />}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  isLoading={
                    (confirmAction === "delete-grades" && deletingGrades) ||
                    (confirmAction === "delete-data" && deletingAllData) ||
                    (confirmAction === "delete-account" && deletingAccount)
                  }
                  disabled={confirmAction === "delete-account" && !deletePassword}
                  onClick={() => {
                    if (confirmAction === "delete-grades") handleDeleteGrades();
                    if (confirmAction === "delete-data") handleDeleteAllData();
                    if (confirmAction === "delete-account") handleDeleteAccount();
                  }}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  {confirmAction === "delete-account" ? "Delete Forever" : "Yes, Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
