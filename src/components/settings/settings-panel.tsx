"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Palette, Shield, Save, Camera,
  Monitor, Sun, Moon, Mail, MessageSquare, Smartphone,
  Eye, EyeOff, AlertCircle, LogOut, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

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
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [importNotif, setImportNotif] = useState(true);
  const [memberNotif, setMemberNotif] = useState(true);
  const [reportNotif, setReportNotif] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold">
                    AM
                  </AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-foreground">Arif Mehmood</p>
                <p className="text-xs text-muted-foreground">arif.mehmood@ecs.pk</p>
                <span className="mt-1 inline-block text-[10px] h-4 px-1.5 bg-primary/10 text-primary border border-primary/20 rounded-md">Administrator</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Full Name</Label>
                <Input defaultValue="Arif Mehmood" className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Email Address</Label>
                <Input defaultValue="arif.mehmood@ecs.pk" type="email" className="h-9 text-sm" />
                {/* TODO: Backend Integration — JWT Authentication */}
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Phone Number</Label>
                <Input defaultValue="0300-1234567" className="h-9 text-sm font-mono" />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Role</Label>
                <Input value="Administrator" disabled className="h-9 text-sm opacity-60" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs font-semibold mb-1.5 block">Organization</Label>
                <Input defaultValue="Election Campaign System — Sialkot Division" className="h-9 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
            <Button onClick={handleSave} size="sm" className="gap-2 bg-primary hover:bg-primary/90 min-w-[100px]">
              {saved ? (
                <><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div> Saved!</>
              ) : (
                <><Save className="w-3.5 h-3.5" /> Save Changes</>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground">
              {/* TODO: Backend Integration — MongoDB API Connection */}
              Changes are local only
            </p>
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
            <Button onClick={handleSave} size="sm" className="gap-2 bg-primary hover:bg-primary/90">
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
