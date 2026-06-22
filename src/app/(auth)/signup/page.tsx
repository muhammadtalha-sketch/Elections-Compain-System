// TODO: Backend Integration
// TODO: JWT Authentication — POST /api/auth/signup
// TODO: Send verification email after registration
// TODO: Hash password with bcrypt on server side
// TODO: Return JWT token and redirect to dashboard

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Vote, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (!/^0[0-9]{3}-[0-9]{7}$/.test(form.phone)) errs.phone = "Format: 0300-1234567";
    if (form.password.length < 8) errs.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    // TODO: Backend Integration
    // const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(form) })
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    window.location.href = "/dashboard";
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text", placeholder: "Muhammad Ali" },
    { key: "email", label: "Email Address", type: "email", placeholder: "name@example.com" },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "0300-1234567" },
  ];

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
            <Vote className="w-4.5 h-4.5 text-white" />
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
            {fields.map((field) => (
              <div key={field.key}>
                <Label className="text-xs font-semibold mb-1.5 block">{field.label}</Label>
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={setField(field.key)}
                  className={cn("h-9 text-sm", field.key === "phone" && "font-mono", errors[field.key] && "border-destructive")}
                  autoComplete={field.key === "email" ? "email" : field.key === "phone" ? "tel" : "name"}
                />
                {errors[field.key] && (
                  <p className="text-[10px] text-destructive mt-1">{errors[field.key]}</p>
                )}
              </div>
            ))}

            {/* Password */}
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={setField("password")}
                  className={cn("h-9 text-sm pr-10", errors.password && "border-destructive")}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-destructive mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={setField("confirmPassword")}
                  className={cn("h-9 text-sm pr-10", errors.confirmPassword && "border-destructive")}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>

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
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>

        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
          <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground">
            {/* TODO: JWT Authentication — Backend not connected yet */}
            Demo mode only. No data is stored or transmitted.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
