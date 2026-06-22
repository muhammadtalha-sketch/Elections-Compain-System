"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, SkipForward, RefreshCw, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ImportResult, downloadErrorReport } from "@/services/importService";
import { cn } from "@/lib/utils";

interface SuccessStepProps {
  result:   ImportResult;
  fileName: string;
  onReset:  () => void;
}

export function SuccessStep({ result, fileName, onReset }: SuccessStepProps) {
  const totalErrors = result.rowErrors.length + result.batchErrors.length;
  const hasErrors   = totalErrors > 0;

  const handleDownloadErrors = () => {
    downloadErrorReport(result.rowErrors, fileName);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-10 space-y-8"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center",
          hasErrors
            ? "bg-amber-100 dark:bg-amber-900/40"
            : "bg-emerald-100 dark:bg-emerald-900/40"
        )}
      >
        <CheckCircle2 className={cn(
          "w-12 h-12",
          hasErrors
            ? "text-amber-600 dark:text-amber-400"
            : "text-emerald-600 dark:text-emerald-400"
        )} />
      </motion.div>

      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {hasErrors ? "Import Completed with Issues" : "Import Successful!"}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {hasErrors
            ? `${result.inserted} records saved to Supabase. Some rows had errors.`
            : `All valid records have been saved to Supabase.`
          }
        </p>
        <p className="text-xs text-muted-foreground font-mono">{fileName}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-xl">
        <ResultCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          value={result.inserted}
          label="Inserted"
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
        />
        {result.updated > 0 && (
          <ResultCard
            icon={<RefreshCw className="w-5 h-5" />}
            value={result.updated}
            label="Updated"
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
          />
        )}
        <ResultCard
          icon={<SkipForward className="w-5 h-5" />}
          value={result.skipped}
          label="Skipped"
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
        />
        <ResultCard
          icon={<XCircle className="w-5 h-5" />}
          value={totalErrors}
          label="Errors"
          color={totalErrors > 0 ? "text-destructive" : "text-muted-foreground"}
          bg={totalErrors > 0 ? "bg-destructive/5 border-destructive/20" : "bg-muted border-border"}
        />
      </div>

      {/* Batch errors */}
      {result.batchErrors.length > 0 && (
        <div className="w-full max-w-xl bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-destructive">{result.batchErrors.length} batch error(s):</p>
          {result.batchErrors.map((e, i) => (
            <p key={i} className="text-xs text-muted-foreground font-mono">{e}</p>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <a href="/dashboard/members">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/25">
            <Users className="w-4 h-4" />
            View Members
          </Button>
        </a>

        <Button variant="outline" onClick={onReset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Import Another File
        </Button>

        {result.rowErrors.length > 0 && (
          <Button variant="ghost" onClick={handleDownloadErrors} className="gap-2 text-destructive hover:text-destructive">
            <Download className="w-4 h-4" />
            Download Error Report ({result.rowErrors.length} rows)
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function ResultCard({
  icon, value, label, color, bg,
}: {
  icon:  React.ReactNode;
  value: number;
  label: string;
  color: string;
  bg:    string;
}) {
  return (
    <div className={cn("rounded-xl border p-4 text-center space-y-1", bg)}>
      <div className={cn("flex justify-center mb-2", color)}>{icon}</div>
      <p className={cn("text-2xl font-bold tabular-nums", color)}>{value.toLocaleString()}</p>
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
    </div>
  );
}
