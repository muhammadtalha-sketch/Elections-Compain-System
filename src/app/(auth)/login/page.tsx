"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Vote, LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const nextPath    = searchParams.get("next") ?? "/dashboard";

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(true);
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }

    setIsLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(
        authError.message.includes("Invalid login")
          ? "Incorrect email or password. Please try again."
          : authError.message
      );
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push(nextPath);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">ECS Portal</span>
          </div>
          <p className="text-white/70 text-sm">Election Campaign System</p>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-white text-3xl font-bold leading-tight">
              Manage your campaign<br />with precision & ease.
            </h2>
            <p className="text-white/70 text-sm mt-3 leading-relaxed">
              Track members, analyse trends, and manage your election campaign data efficiently with our enterprise-grade platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {[{ value: "1,027+", label: "Members" }, { value: "15", label: "Areas" }, { value: "7", label: "Users" }].map((s) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                <p className="text-white text-xl font-bold">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs">© 2024 ECS Portal — Sialkot Division</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Vote className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">ECS Portal</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your ECS account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Email Address</Label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="h-10 text-sm"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs font-semibold">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="h-10 text-sm pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary cursor-pointer"
              />
              <Label htmlFor="remember" className="text-xs font-normal cursor-pointer">Remember me</Label>
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
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Account creation is restricted. Contact your administrator.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
