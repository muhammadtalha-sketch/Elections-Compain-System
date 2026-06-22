"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, File, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { parseFile, type ParsedFile } from "@/services/importService";

interface UploadStepProps {
  onParsed: (result: ParsedFile) => void;
}

const ACCEPTED = [".xlsx", ".xls", ".csv"];
const MAX_MB   = 20;

function fmt(bytes: number) {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadStep({ onParsed }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status,     setStatus]     = useState<"idle" | "parsing" | "error">("idle");
  const [errorMsg,   setErrorMsg]   = useState("");
  const [parsedInfo, setParsedInfo] = useState<{ name: string; size: number; rows: number; cols: number } | null>(null);

  const process = useCallback(async (f: File) => {
    if (!ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setStatus("error");
      setErrorMsg(`Unsupported format. Please upload ${ACCEPTED.join(", ")}.`);
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setStatus("error");
      setErrorMsg(`File too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }

    setStatus("parsing");
    setErrorMsg("");

    try {
      const result = await parseFile(f);
      setParsedInfo({ name: f.name, size: f.size, rows: result.totalRows, cols: result.headers.length });
      onParsed(result);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg((err as Error).message ?? "Unknown parse error.");
    }
  }, [onParsed]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) process(f);
  }, [process]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) process(f);
  };

  const reset = () => { setStatus("idle"); setParsedInfo(null); setErrorMsg(""); };

  return (
    <div className="space-y-6">
      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { n: "1", icon: FileSpreadsheet, label: "Prepare file",       desc: "Excel (.xlsx / .xls) or CSV",            color: "text-primary",     bg: "bg-primary/10"              },
          { n: "2", icon: Upload,          label: "Upload & detect",     desc: "We read your column headers",            color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/30" },
          { n: "3", icon: CheckCircle2,    label: "Map & import",        desc: "Match columns to database fields",        color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-3 p-3.5 bg-muted/40 rounded-xl border border-border">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", s.bg)}>
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">{s.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.desc}</p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">{s.n}</span>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 select-none",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border hover:border-primary/60 hover:bg-muted/30"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("wiz-file-input")?.click()}
          >
            <input
              id="wiz-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={onInput}
            />

            <motion.div
              animate={isDragging ? { scale: 1.12, y: -6 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="w-18 h-18 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5"
            >
              <Upload className="w-9 h-9 text-primary" />
            </motion.div>

            <h4 className="text-base font-bold text-foreground mb-2">
              {isDragging ? "Drop your file here" : "Drag & drop your file"}
            </h4>
            <p className="text-sm text-muted-foreground mb-5">
              or{" "}
              <span className="text-primary font-semibold cursor-pointer hover:underline">
                browse to upload
              </span>
            </p>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[".xlsx", ".xls", ".csv"].map((ext) => (
                <Badge key={ext} variant="outline" className="text-xs gap-1 font-mono">
                  <FileSpreadsheet className="w-3 h-3" />
                  {ext.toUpperCase()}
                </Badge>
              ))}
              <Badge variant="secondary" className="text-xs">Max {MAX_MB} MB</Badge>
            </div>
          </motion.div>
        )}

        {status === "parsing" && (
          <motion.div
            key="parsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-border rounded-2xl p-10 bg-muted/20 flex flex-col items-center gap-5"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                className="w-12 h-12 rounded-full border-[3px] border-primary/20 border-t-primary"
              />
              <FileSpreadsheet className="absolute inset-0 m-auto w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Reading your file…</p>
              <p className="text-xs text-muted-foreground mt-1">Detecting column headers and row count</p>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-destructive/30 rounded-2xl p-6 bg-destructive/5 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Could not read file</p>
              <p className="text-xs text-muted-foreground mt-0.5">{errorMsg}</p>
            </div>
            <Button size="sm" variant="outline" onClick={reset} className="flex-shrink-0">
              <X className="w-3.5 h-3.5 mr-1" /> Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File summary — shown while wizard moves to next step */}
      {parsedInfo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 truncate">
              {parsedInfo.name}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400/70 mt-0.5">
              {parsedInfo.rows.toLocaleString()} rows · {parsedInfo.cols} columns · {fmt(parsedInfo.size)}
            </p>
          </div>
          <Badge className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-0">
            File ready
          </Badge>
        </motion.div>
      )}

      {/* Accepted formats note */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <File className="w-3 h-3" />
        <span>
          Supported: <strong>Excel 97-2007 (.xls)</strong>, <strong>Excel 2007+ (.xlsx)</strong>,{" "}
          <strong>CSV (.csv)</strong> · Up to {MAX_MB} MB · First row must contain headers
        </span>
      </div>
    </div>
  );
}
