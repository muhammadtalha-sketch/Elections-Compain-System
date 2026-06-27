"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Vote, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }

    setIsLoading(true);
    setError("");

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    setDone(true);
    setIsLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Check your inbox</h2>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a password reset link to <strong className="text-foreground">{email}</strong>.
              It will expire in 1 hour.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => { setDone(false); setEmail(""); }}
              className="text-primary hover:underline"
            >
              try again
            </button>.
          </p>
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Button>
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
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            No problem. Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
              autoComplete="email"
            />
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
                Sending link…
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <Link href="/login" className="flex items-center justify-center gap-1.5 mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </motion.div>
    </div>
  );
}
