"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera, Check, Eye, EyeOff, AlertCircle, Shield,
  LogOut, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { initials, ROLE_BADGE } from "@/lib/rbac";

// ─── Shared primitives ─────────────────────────────────────────────────────────

function Card({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm"
    >
      <div className="mb-5 pb-4 border-b border-border">
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
      <Label className="text-xs font-semibold mb-1.5 block text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Spinner() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}

// ─── Avatar upload ─────────────────────────────────────────────────────────────

function AvatarUpload() {
  const { user, profile, refreshProfile } = useAuth();
  const userEmail = user?.email;
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
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
        <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
          )}
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
      <div>
        <p className="text-sm font-semibold text-foreground">{profile?.full_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{userEmail}</p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-1.5 text-xs text-primary hover:underline font-medium"
        >
          Change photo
        </button>
      </div>
    </div>
  );
}

// ─── Personal Information ──────────────────────────────────────────────────────

function PersonalInfoSection() {
  const { user, profile, role, refreshProfile } = useAuth();
  const [form,    setForm]    = useState({ name: profile?.full_name ?? "", phone: profile?.phone ?? "" });
  const [saving,  setSaving]  = useState(false);
  const [changed, setChanged] = useState(false);

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setChanged(true);
  };

  const save = async () => {
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
    <Card title="Personal Information" description="Update your name, phone number and profile picture.">
      <div className="space-y-6">
        <AvatarUpload />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <Input value={form.name} onChange={onChange("name")} placeholder="Your full name" />
          </Field>
          <Field label="Email Address">
            <Input value={user?.email ?? ""} disabled className="opacity-60" />
            <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed here.</p>
          </Field>
          <Field label="Phone Number">
            <Input value={form.phone} onChange={onChange("phone")} placeholder="0300-1234567" />
          </Field>
          <Field label="Role">
            {role && (
              <div className="flex items-center h-9 px-3">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md", ROLE_BADGE[role])}>
                  {role}
                </span>
              </div>
            )}
          </Field>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={!changed || saving} className="gap-2 h-9 px-5">
            {saving ? <Spinner /> : <Check className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Change Password ───────────────────────────────────────────────────────────

function SecuritySection() {
  const [form,   setForm]   = useState({ current: "", next: "", confirm: "" });
  const [show,   setShow]   = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const toggle = (k: keyof typeof show) => () => setShow((p) => ({ ...p, [k]: !p[k] }));

  const save = async () => {
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
    <Card title="Change Password" description="Use a strong, unique password.">
      <div className="space-y-4 max-w-sm">
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {(["current", "next", "confirm"] as const).map((key) => {
          const labels = {
            current: "Current Password",
            next:    "New Password",
            confirm: "Confirm New Password",
          };
          return (
            <Field key={key} label={labels[key]}>
              <div className="relative">
                <Input
                  type={show[key] ? "text" : "password"}
                  placeholder="••••••••"
                  value={form[key]}
                  onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setError(""); }}
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

        <div className="flex justify-end pt-1">
          <Button onClick={save} disabled={!form.next || !form.confirm || saving} className="gap-2 h-9 px-5">
            {saving ? <Spinner /> : <Shield className="w-4 h-4" />}
            {saving ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState({ email: true, system: true });
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <Card title="Notifications" description="Choose how you receive updates.">
      <div className="space-y-4">
        {([
          { key: "email",  label: "Email Notifications",  desc: "Receive important updates via email" },
          { key: "system", label: "System Notifications", desc: "In-app alerts and activity notifications" },
        ] as const).map((item) => (
          <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer group">
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[item.key]}
              onClick={() => toggle(item.key)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                prefs[item.key] ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                prefs[item.key] ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
          </label>
        ))}
      </div>
    </Card>
  );
}

// ─── Logout ────────────────────────────────────────────────────────────────────

function LogoutSection() {
  const { signOut } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const [busy,    setBusy]    = useState(false);

  const doLogout = async () => {
    setBusy(true);
    await signOut();
  };

  return (
    <Card title="Logout" description="Sign out of your account on this device.">
      {!confirm ? (
        <Button
          variant="destructive"
          className="gap-2"
          onClick={() => setConfirm(true)}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-foreground font-medium">Are you sure you want to logout?</p>
          <div className="flex gap-3">
            <Button variant="destructive" className="gap-2" onClick={doLogout} disabled={busy}>
              {busy ? <Spinner /> : <LogOut className="w-4 h-4" />}
              {busy ? "Signing out…" : "Yes, Logout"}
            </Button>
            <Button variant="outline" onClick={() => setConfirm(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user, profile, role } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
        {role && (
          <span className={cn("inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md", ROLE_BADGE[role])}>
            {role}
          </span>
        )}
      </div>

      <PersonalInfoSection key={profile?.updated_at} />
      <SecuritySection />
      <NotificationsSection />
      <LogoutSection />
    </div>
  );
}
