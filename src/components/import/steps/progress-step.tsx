"use client";

import { motion } from "framer-motion";
import { Database, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressStepProps {
  done:      number;
  total:     number;
  errors:    number;
  fileName:  string;
}

export function ProgressStep({ done, total, errors, fileName }: ProgressStepProps) {
  const pct     = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const remaining = total - done;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      {/* Animated icon */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Database className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Labels */}
      <div className="text-center space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">Importing Records…</h3>
        <p className="text-sm text-muted-foreground">
          Writing to Supabase in batches of 500
        </p>
        <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">{fileName}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md space-y-3">
        <Progress value={pct} className="h-3 rounded-full" />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {done.toLocaleString()} / {total.toLocaleString()} records
          </span>
          <span className="font-bold text-primary text-base">{pct}%</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-8 text-xs">
        <Stat label="Inserted"  value={done}      color="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Remaining" value={remaining}  color="text-foreground" />
        {errors > 0 && (
          <Stat label="Errors" value={errors} color="text-destructive" />
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Do not close this tab during import</span>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-bold tabular-nums ${color}`}>{value.toLocaleString()}</p>
      <p className="text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
