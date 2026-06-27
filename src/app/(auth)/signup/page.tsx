"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Vote, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { isSuperAdmin } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [isLoading,   setIsLoading]   = useState(false);
  const [done,        setDone]        = useState(false);

  const setField = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Full name is required (min 2 chars)";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (form.phone && !/^[0-9\-+ ]{7,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (form.password.length < 8) errs.password = "Minimum 8 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: { full_name: form.name.trim() },
      },
    });

    if (error) {
      setErrors({ _: error.message });
      setIsLoading(false);
      return;
    }

    // Assign role: Super Admin for the owner email, User for everyone else
    if (data.user) {
      const role = isSuperAdmin(form.email) ? 'Super Admin' : 'User';
      await supabase.from('profiles').upsert({
        id:        data.user.id,
        full_name: form.name.trim(),
        email:     form.email.toLowerCase(),
        phone:     form.phone.trim() || null,
        role,
        is_active: true,
      }, { onConflict: 'id' });
    }

    // If email confirmation required → show success message; otherwise redirect
    if (data.session) {
      toast.success("Account created! Welcome to ECS Portal.");
      router.push("/dashboard");
    } else {
      setDone(true);
    }

    setIsLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login">
            <Button variant="outline" size="sm">Back to Sign In</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Vote className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-foreground leading-none">ECS Portal</p>
            <p className="text-[10px] text-muted-foreground">Election Campaign System</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join the ECS campaign management platform</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            {errors._ && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-medium">{errors._}</p>
              </motion.div>
            )}

            {[
              { key: "name",  label: "Full Name",     type: "text",  placeholder: "Muhammad Ali",       auto: "name"  },
              { key: "email", label: "Email Address",  type: "email", placeholder: "name@example.com",   auto: "email" },
              { key: "phone", label: "Phone Number",   type: "tel",   placeholder: "0300-1234567 (optional)", auto: "tel" },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs font-semibold mb-1.5 block">{f.label}</Label>
                <Input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={setField(f.key)}
                  className={cn("h-9 text-sm", f.key === "phone" && "font-mono", errors[f.key] && "border-destructive")}
                  autoComplete={f.auto}
                />
                {errors[f.key] && <p className="text-[10px] text-destructive mt-1">{errors[f.key]}</p>}
              </div>
            ))}

            {[
              { key: "password", label: "Password",         show: showPw,      toggle: () => setShowPw(p => !p),      auto: "new-password" },
              { key: "confirm",  label: "Confirm Password", show: showConfirm, toggle: () => setShowConfirm(p => !p), auto: "new-password" },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs font-semibold mb-1.5 block">{f.label}</Label>
                <div className="relative">
                  <Input
                    type={f.show ? "text" : "password"}
                    placeholder="••••••••"
                    value={form[f.key as keyof typeof form]}
                    onChange={setField(f.key)}
                    className={cn("h-9 text-sm pr-10", errors[f.key] && "border-destructive")}
                    autoComplete={f.auto}
                  />
                  <button type="button" onClick={f.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors[f.key] && <p className="text-[10px] text-destructive mt-1">{errors[f.key]}</p>}
              </div>
            ))}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 mt-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Creating account…
                </>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
