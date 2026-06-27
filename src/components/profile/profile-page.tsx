"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  User, Shield, Bell, Activity, Sliders,
  Camera, Check, X, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { initials, ROLE_BADGE } from "@/lib/rbac";

const TABS = [
  { id: "profile",       label: "My Profile",   icon: User      },
  { id: "security",      label: "Security",      icon: Shield    },
  { id: "notifications", label: "Notifications", icon: Bell      },
  { id: "activity",      label: "Activity",      icon: Activity  },
  { id: "preferences",   label: "Preferences",   icon: Sliders   },
] as const;

type Tab = typeof TABS[number]["id"];

export function ProfilePage() {
  const searchParams = useSearchParams();
  const defaultTab   = (searchParams.get("tab") as Tab) ?? "profile";
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const { user, profile, role, refreshProfile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <AvatarUpload />
        <div>
          <h2 className="text-xl font-bold text-foreground">{profile?.full_name ?? "User"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          {role && (
            <span className={cn("inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md", ROLE_BADGE[role])}>
              {role}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div>
        {activeTab === "profile"       && <ProfileTab       key="profile" />}
        {activeTab === "security"      && <SecurityTab      key="security" />}
        {activeTab === "notifications" && <NotificationsTab key="notifications" />}
        {activeTab === "activity"      && <ActivityTab      key="activity" />}
        {activeTab === "preferences"   && <PreferencesTab   key="preferences" />}
      </div>

      {/* suppress unused */}
      <span className="hidden">{refreshProfile.toString()}</span>
    </div>
  );
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────

function AvatarUpload() {
  const { user, profile, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return; }

    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      await refreshProfile();
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
      <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
        {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "Avatar"} />}
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
          {initials(profile?.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <Camera className="w-5 h-5 text-white" />
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth();
  const [form,      setForm]      = useState({ name: profile?.full_name ?? "", phone: profile?.phone ?? "" });
  const [saving,    setSaving]    = useState(false);
  const [changed,   setChanged]   = useState(false);

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setChanged(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.name.trim(),
      phone:     form.phone.trim() || null,
    }).eq("id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("Profile updated");
      setChanged(false);
    }
    setSaving(false);
  };

  return (
    <Card title="Personal Information" description="Update your name and contact details.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name">
          <Input value={form.name} onChange={handleChange("name")} placeholder="Your full name" />
        </Field>
        <Field label="Email Address">
          <Input value={user?.email ?? ""} disabled className="opacity-60" />
          <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed here.</p>
        </Field>
        <Field label="Phone Number">
          <Input value={form.phone} onChange={handleChange("phone")} placeholder="0300-1234567" />
        </Field>
        <Field label="Account ID">
          <Input value={(user?.id?.slice(0, 8) ?? "") + "…"} disabled className="font-mono opacity-60 text-xs" />
        </Field>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={!changed || saving} className="gap-2 h-9 px-5">
          {saving ? <Spinner /> : <Check className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState("");

  const toggle = (key: keyof typeof show) => () => setShow(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    if (form.next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (form.next !== form.confirm) { setError("Passwords do not match."); return; }

    setSaving(true);
    setError("");

    const { error: err } = await supabase.auth.updateUser({ password: form.next });
    if (err) {
      setError(err.message);
    } else {
      toast.success("Password changed successfully");
      setForm({ current: "", next: "", confirm: "" });
    }
    setSaving(false);
  };

  return (
    <Card title="Change Password" description="Use a strong, unique password you don't use elsewhere.">
      <div className="space-y-4 max-w-sm">
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {(["current", "next", "confirm"] as const).map(key => {
          const labels = { current: "Current Password", next: "New Password", confirm: "Confirm New Password" };
          return (
            <Field key={key} label={labels[key]}>
              <div className="relative">
                <Input
                  type={show[key] ? "text" : "password"}
                  placeholder="••••••••"
                  value={form[key]}
                  onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setError(""); }}
                  className="pr-10"
                  autoComplete={key === "current" ? "current-password" : "new-password"}
                />
                <button type="button" onClick={toggle(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={!form.next || !form.confirm || saving} className="gap-2 h-9 px-5">
          {saving ? <Spinner /> : <Shield className="w-4 h-4" />}
          {saving ? "Updating…" : "Update Password"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email_imports: true,
    email_members: true,
    email_reports: false,
    push_all:      true,
  });

  return (
    <Card title="Notification Preferences" description="Choose when and how you receive updates.">
      <div className="space-y-4">
        {([
          { key: "email_imports", label: "Import completions",   desc: "When a bulk import finishes" },
          { key: "email_members", label: "New member alerts",    desc: "When a new member is added" },
          { key: "email_reports", label: "Weekly digest",        desc: "Weekly summary email every Monday" },
          { key: "push_all",      label: "In-app notifications", desc: "Show notifications in the portal" },
        ] as const).map(item => (
          <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer group">
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <div
              onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
              className={cn(
                "relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0",
                prefs[item.key] ? "bg-primary" : "bg-muted"
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                prefs[item.key] ? "translate-x-5" : "translate-x-0.5"
              )} />
            </div>
          </label>
        ))}
      </div>
    </Card>
  );
}

// ─── Activity Tab ──────────────────────────────────────────────────────────────

function ActivityTab() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Array<{ id: string; action: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("activity_logs")
      .select("id, action, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setActivities((data ?? []) as typeof activities);
        setLoading(false);
      });
  }, [user]);

  return (
    <Card title="Recent Activity" description="Your last 20 actions in the system.">
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {activities.map(a => (
            <div key={a.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium capitalize">{a.action.replace(/_/g, " ")}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(a.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Preferences Tab ──────────────────────────────────────────────────────────

function PreferencesTab() {
  const [lang, setLang] = useState("en");

  return (
    <Card title="Preferences" description="Customise your portal experience.">
      <Field label="Language">
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="en">English</option>
          <option value="ur">اردو (Urdu)</option>
        </select>
      </Field>
      <p className="mt-4 text-xs text-muted-foreground">
        Theme is controlled by the sun/moon toggle in the top navigation bar.
      </p>
    </Card>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm"
    >
      <div className="mb-5">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />;
}

// Suppress unused X import
const _X = X;
void _X;
