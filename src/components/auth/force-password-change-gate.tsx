"use client";

import { useState } from "react";
import { KeyRound, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

// Blocks the dashboard until a user with an admin-issued temporary password
// sets their own. Cleared by settings/profile password-change handlers, which
// also flip profiles.must_change_password back to false.
export function ForcePasswordChangeGate() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!profile?.must_change_password) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.next !== form.confirm) { setError("Passwords do not match."); return; }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password: form.next });
    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    if (user) await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
    await refreshProfile();
    toast.success("Password updated");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Set a new password</h2>
            <p className="text-xs text-muted-foreground">Required before you can continue</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}
          <Input
            type="password"
            placeholder="New password"
            value={form.next}
            onChange={e => { setForm(p => ({ ...p, next: e.target.value })); setError(""); }}
            className="h-9 text-sm"
            autoComplete="new-password"
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={form.confirm}
            onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setError(""); }}
            className="h-9 text-sm"
            autoComplete="new-password"
          />
          <Button type="submit" disabled={saving} className="w-full h-9 text-sm gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Set Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
