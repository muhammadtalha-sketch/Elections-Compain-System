"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Vote, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready,       setReady]       = useState(false);  // true once Supabase session is loaded
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState("");

  // Supabase sets the session from the URL hash on PASSWORD_RECOVERY event
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also check if we already have a session (e.g. user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }

    setIsLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setDone(true);
    toast.success("Password updated successfully!");
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Password updated!</h2>
          <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Vote className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-foreground leading-none">ECS Portal</p>
            <p className="text-[10px] text-muted-foreground">Election Campaign System</p>
          </div>
        </div>

        <div className="mb-7">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </motion.div>
          )}

          {[
            { key: "password", label: "New Password",      value: password,    set: setPassword, show: showPw,      toggle: () => setShowPw(p => !p) },
            { key: "confirm",  label: "Confirm Password",  value: confirm,     set: setConfirm,  show: showConfirm, toggle: () => setShowConfirm(p => !p) },
          ].map((f) => (
            <div key={f.key}>
              <Label className="text-xs font-semibold mb-1.5 block">{f.label}</Label>
              <div className="relative">
                <Input
                  type={f.show ? "text" : "password"}
                  placeholder="••••••••"
                  value={f.value}
                  onChange={(e) => { f.set(e.target.value); setError(""); }}
                  className={cn("h-10 text-sm pr-10", error && "border-destructive")}
                  autoComplete="new-password"
                />
                <button type="button" onClick={f.toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
            {["At least 8 characters", "Mix of letters and numbers", "Avoid common passwords"].map(r => (
              <p key={r} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />{r}
              </p>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Updating…
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
