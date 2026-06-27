"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Palette, Shield, Save, Camera,
  Monitor, Sun, Moon, Mail, MessageSquare, Smartphone,
  Eye, EyeOff, AlertCircle, LogOut, Loader2, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { initials, ROLE_BADGE } from "@/lib/rbac";

function SecurityContent() {
  const { signOut } = useAuth();
  const [form,    setForm]    = useState({ next: "", confirm: "" });
  const [show,    setShow]    = useState({ next: false, confirm: false });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const toggle = (k: keyof typeof show) => () => setShow((p) => ({ ...p, [k]: !p[k] }));

  const changePassword = async () => {
    if (form.next.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.next !== form.confirm) { setError("Passwords do not match."); return; }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password: form.next });
    if (err) {
      setError(err.message);
    } else {
      toast.success("Password changed successfully");
      setForm({ next: "", confirm: "" });
    }
    setSaving(false);
  };

  const doLogout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  return (
    <>
      {/* Change Password */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-3">Change Password</p>
        <div className="space-y-3 max-w-sm">
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
          {(["next", "confirm"] as const).map((key) => (
            <div key={key}>
              <Label className="text-xs mb-1.5 block">
                {key === "next" ? "New Password" : "Confirm Password"}
              </Label>
              <div className="relative">
                <Input
                  type={show[key] ? "text" : "password"}
                  placeholder="••••••••"
                  value={form[key]}
                  onChange={(e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setError(""); }}
                  className="h-9 text-sm pr-10"
                  autoComplete="new-password"
                />
                <button type="button" onClick={toggle(key)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            className="gap-2 h-9"
            onClick={changePassword}
            disabled={!form.next || !form.confirm || saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {saving ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Logout */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-1">Logout</p>
        <p className="text-xs text-muted-foreground mb-3">Sign out of your account on this device.</p>
        {!confirm ? (
          <Button variant="destructive" size="sm" className="gap-2 h-9" onClick={() => setConfirm(true)}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-foreground font-medium">Are you sure you want to logout?</p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" className="gap-2 h-9" onClick={doLogout} disabled={loggingOut}>
                {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                {loggingOut ? "Signing out…" : "Yes, Logout"}
              </Button>
              <Button variant="outline" size="sm" className="h-9" onClick={() => setConfirm(false)} disabled={loggingOut}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { user, profile, role, refreshProfile } = useAuth();

  // Profile form — seeded from auth context
  const [name,    setName]    = useState(profile?.full_name ?? "");
  const [phone,   setPhone]   = useState(profile?.phone    ?? "");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif,   setSmsNotif]   = useState(false);
  const [importNotif, setImportNotif] = useState(true);
  const [memberNotif, setMemberNotif] = useState(true);
  const [reportNotif, setReportNotif] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim(), phone: phone.trim() || null })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
    } else {
      await refreshProfile();
      toast.success("Profile updated");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return; }
    setUploading(true);
    try {
      const ext  = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("profiles")
        .update({ avatar_url: publicUrl }).eq("id", user.id);
      if (dbErr) throw dbErr;
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
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="h-9 mb-5 bg-muted/60">
        <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="w-3 h-3" />Profile</TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs gap-1.5"><Bell className="w-3 h-3" />Notifications</TabsTrigger>
        <TabsTrigger value="theme" className="text-xs gap-1.5"><Palette className="w-3 h-3" />Theme</TabsTrigger>
        <TabsTrigger value="security" className="text-xs gap-1.5"><Shield className="w-3 h-3" />Security</TabsTrigger>
      </TabsList>

      {/* Profile */}
      <TabsContent value="profile">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-sm">Profile Settings</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Update your personal information</p>
          </div>

          <div className="p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <Avatar className="h-16 w-16">
                  {profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xl font-bold">
                    {initials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Camera className="w-4 h-4 text-white" />
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile?.full_name || user?.email || "—"}</p>
                <p className="text-xs text-muted-foreground">{user?.email ?? "—"}</p>
                {role && (
                  <span className={cn("mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded-md font-semibold", ROLE_BADGE[role])}>
                    {role}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Full Name</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Email Address</Label>
                <Input value={user?.email ?? ""} disabled className="h-9 text-sm opacity-60" />
                <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Phone Number</Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0300-0000000"
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Role</Label>
                <Input value={role ?? ""} disabled className="h-9 text-sm opacity-60" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
            <Button onClick={handleSaveProfile} size="sm" disabled={saving} className="gap-2 bg-primary hover:bg-primary/90 min-w-[110px]">
              {saving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
              ) : saved ? (
                <><Check className="w-3.5 h-3.5" /> Saved!</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Save Changes</>
              )}
            </Button>
          </div>
        </motion.div>
      </TabsContent>

      {/* Notifications */}
      <TabsContent value="notifications">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-sm">Notification Preferences</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Control how you receive alerts</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Delivery Channels
              </p>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email notifications", desc: "Receive alerts to your email", value: emailNotif, set: setEmailNotif },
                  { icon: Smartphone, label: "SMS notifications", desc: "Receive SMS on your phone", value: smsNotif, set: setSmsNotif },
                  { icon: MessageSquare, label: "In-app notifications", desc: "Show in dashboard bell", value: true, set: () => {} },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.set} />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-primary" /> Event Types
              </p>
              <div className="space-y-2">
                {[
                  { label: "Import completed", value: importNotif, set: setImportNotif },
                  { label: "New member added", value: memberNotif, set: setMemberNotif },
                  { label: "Weekly reports", value: reportNotif, set: setReportNotif },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <p className="text-xs text-foreground">{item.label}</p>
                    <Switch checked={item.value} onCheckedChange={item.set} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => toast.success("Preferences saved")}>
              <Save className="w-3.5 h-3.5" /> Save Preferences
            </Button>
          </div>
        </motion.div>
      </TabsContent>

      {/* Theme */}
      <TabsContent value="theme">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-sm">Theme Settings</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Customize your visual experience</p>
          </div>

          <div className="p-6">
            <p className="text-xs font-semibold text-foreground mb-3">Appearance</p>
            <div className="grid grid-cols-3 gap-3 max-w-sm">
              {[
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
                { value: "system", icon: Monitor, label: "System" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    theme === opt.value
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  <opt.icon className={cn("w-5 h-5", theme === opt.value ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-semibold", theme === opt.value ? "text-primary" : "text-muted-foreground")}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <Separator className="my-5" />

            <div className="max-w-sm">
              <p className="text-xs font-semibold text-foreground mb-3">Language</p>
              <Select defaultValue="en">
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">اردو (Urdu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </TabsContent>

      {/* Security */}
      <TabsContent value="security">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-sm">Security Settings</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Authentication and access control</p>
          </div>

          <div className="p-6 space-y-6">
            <SecurityContent />
          </div>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
}
