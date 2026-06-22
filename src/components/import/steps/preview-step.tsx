"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ValidatedRow, type DbField, DB_FIELD_LABELS } from "@/services/importService";

interface PreviewStepProps {
  rows:    ValidatedRow[];
  mapping: Record<string, DbField>;
  duplicateAction: "skip" | "update" | "import";
  onDuplicateActionChange: (a: "skip" | "update" | "import") => void;
}

const PREVIEW_LIMIT = 20;

export function PreviewStep({ rows, mapping, duplicateAction, onDuplicateActionChange }: PreviewStepProps) {
  const [showErrors, setShowErrors] = useState(false);

  const validRows     = rows.filter((r) => r.errors.length === 0 && !r.isDuplicate);
  const errorRows     = rows.filter((r) => r.errors.length > 0);
  const warningRows   = rows.filter((r) => r.warnings.length > 0 && r.errors.length === 0);
  const duplicateRows = rows.filter((r) => r.isDuplicate);

  // Mapped headers (not skipped) in order
  const mappedHeaders = Object.entries(mapping)
    .filter(([, f]) => f !== "__skip__")
    .slice(0, 7);   // show at most 7 columns in preview

  const previewRows = rows.slice(0, PREVIEW_LIMIT);

  const dupOptions: { value: "skip" | "update" | "import"; label: string; desc: string }[] = [
    { value: "skip",   label: "Skip Duplicates",       desc: "Keep existing records, skip these rows" },
    { value: "update", label: "Update Existing",        desc: "Overwrite existing records (by serial #)" },
    { value: "import", label: "Import Anyway",          desc: "Insert as new records regardless" },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          value={rows.length}
          label="Total Rows"
          color="text-foreground"
          bg="bg-muted/60"
          icon={<Copy className="w-4 h-4" />}
        />
        <StatCard
          value={validRows.length}
          label="Valid"
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-950/40"
          border="border-emerald-200 dark:border-emerald-800"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          value={duplicateRows.length}
          label="Duplicates"
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-50 dark:bg-amber-950/40"
          border="border-amber-200 dark:border-amber-800"
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <StatCard
          value={errorRows.length}
          label="Errors"
          color="text-destructive"
          bg="bg-destructive/5"
          border="border-destructive/20"
          icon={<AlertCircle className="w-4 h-4" />}
        />
      </div>

      {/* Duplicate handling (only shown if there are duplicates) */}
      {duplicateRows.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {duplicateRows.length} duplicate {duplicateRows.length === 1 ? "record" : "records"} found — how should we handle them?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {dupOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDuplicateActionChange(opt.value)}
                className={cn(
                  "text-left p-3 rounded-lg border text-xs transition-all",
                  duplicateAction === opt.value
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-background hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 flex-shrink-0",
                    duplicateAction === opt.value ? "border-primary bg-primary" : "border-border"
                  )} />
                  <span className={cn("font-semibold", duplicateAction === opt.value && "text-primary")}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground pl-4.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error list (collapsible) */}
      {errorRows.length > 0 && (
        <div className="border border-destructive/20 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowErrors((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left"
          >
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-xs font-semibold text-destructive flex-1">
              {errorRows.length} row{errorRows.length > 1 ? "s" : ""} with errors — will be skipped
            </span>
            {showErrors
              ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            }
          </button>

          <AnimatePresence>
            {showErrors && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-border/50 max-h-48 overflow-y-auto">
                  {errorRows.slice(0, 50).map((r) => (
                    <div key={r.rowIndex} className="flex items-start gap-3 px-4 py-2.5 text-xs">
                      <span className="font-mono text-muted-foreground w-12 flex-shrink-0">Row {r.rowIndex}</span>
                      <div className="flex-1 flex flex-wrap gap-1.5">
                        {r.errors.map((e, i) => (
                          <span key={i} className="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded text-[10px]">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {errorRows.length > 50 && (
                    <div className="px-4 py-2 text-[10px] text-muted-foreground text-center">
                      +{errorRows.length - 50} more errors…
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Warnings inline note */}
      {warningRows.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {warningRows.length} row{warningRows.length > 1 ? "s" : ""} have minor warnings but will still be imported.
        </div>
      )}

      {/* Data preview table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
          <p className="text-xs font-semibold text-foreground">
            Data Preview
            <span className="text-muted-foreground font-normal ml-1.5">
              (first {Math.min(PREVIEW_LIMIT, rows.length)} of {rows.length.toLocaleString()} rows)
            </span>
          </p>
          {rows.length > PREVIEW_LIMIT && (
            <Badge variant="secondary" className="text-[10px]">
              +{(rows.length - PREVIEW_LIMIT).toLocaleString()} more rows not shown
            </Badge>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground w-12">#</th>
                {mappedHeaders.map(([header, field]) => (
                  <th key={header} className="px-3 py-2.5 text-left font-semibold text-muted-foreground">
                    <div className="text-[10px] text-muted-foreground/60 font-normal">{header}</div>
                    <div>{DB_FIELD_LABELS[field]}</div>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, idx) => {
                const hasError    = row.errors.length > 0;
                const isDup       = row.isDuplicate;
                const hasWarning  = row.warnings.length > 0;

                return (
                  <motion.tr
                    key={row.rowIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={cn(
                      "border-b border-border/50",
                      hasError  && "bg-destructive/5",
                      isDup     && !hasError && "bg-amber-50/50 dark:bg-amber-950/20",
                      hasWarning && !hasError && !isDup && "bg-yellow-50/30 dark:bg-yellow-950/10",
                    )}
                  >
                    <td className="px-3 py-2.5 font-mono text-muted-foreground text-[10px]">
                      {row.rowIndex}
                    </td>
                    {mappedHeaders.map(([header]) => (
                      <td key={header} className="px-3 py-2.5 max-w-[160px] truncate text-foreground">
                        {row.raw[header] || <span className="text-muted-foreground/40">—</span>}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      {hasError ? (
                        <Badge className="text-[9px] h-4 px-1.5 bg-destructive/10 text-destructive border-0">
                          Error
                        </Badge>
                      ) : isDup ? (
                        <Badge className="text-[9px] h-4 px-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-0">
                          Duplicate
                        </Badge>
                      ) : hasWarning ? (
                        <Badge className="text-[9px] h-4 px-1.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-0">
                          Warning
                        </Badge>
                      ) : (
                        <Badge className="text-[9px] h-4 px-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-0">
                          Valid
                        </Badge>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value, label, color, bg, border, icon,
}: {
  value:   number;
  label:   string;
  color:   string;
  bg:      string;
  border?: string;
  icon:    React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl p-4 border", bg, border ?? "border-border")}>
      <div className={cn("flex items-center gap-1.5 mb-1", color)}>
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", color)}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export function PreviewStepActions({
  rows, mapping, onNext,
}: {
  rows:    ValidatedRow[];
  mapping: Record<string, DbField>;
  onNext:  () => void;
}) {
  const importable = rows.filter((r) => r.errors.length === 0).length;
  const nameMapped = Object.values(mapping).includes("name");

  return (
    <Button
      onClick={onNext}
      disabled={importable === 0 || !nameMapped}
      className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/25"
    >
      Import {importable.toLocaleString()} Records
    </Button>
  );
}
