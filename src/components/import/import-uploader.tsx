"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, File, CheckCircle2, XCircle, FileSpreadsheet,
  X, AlertCircle, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "dragging" | "uploading" | "processing" | "success" | "error";

const MOCK_PREVIEW_DATA = [
  { serial: "SLK-0121", name: "Asad Munir", father: "Muhammad Munir", gender: "Male", area: "Cantonment" },
  { serial: "SLK-0122", name: "Naila Pervaiz", father: "Pervaiz Ahmad", gender: "Female", area: "Rangpura" },
  { serial: "SLK-0123", name: "Zafar Iqbal", father: "Iqbal Ahmed", gender: "Male", area: "Model Town" },
  { serial: "SLK-0124", name: "Sana Javed", father: "Javed Akhtar", gender: "Female", area: "Paris Road" },
  { serial: "SLK-0125", name: "Khalid Farooq", father: "Farooq Ahmed", gender: "Male", area: "Hajipura" },
];

export function ImportUploader() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const simulateUpload = (f: File) => {
    setFile(f);
    setUploadState("uploading");
    setProgress(0);
    setShowPreview(false);

    // FUTURE BACKEND INTEGRATION — Excel Import Processing
    // TODO: POST /api/import with FormData, JWT auth, parse XLSX/CSV server-side
    const steps = [
      { progress: 15, delay: 400 },
      { progress: 35, delay: 800 },
      { progress: 60, delay: 1200 },
      { progress: 80, delay: 1600 },
      { progress: 95, delay: 2000 },
    ];

    steps.forEach(({ progress: p, delay }) => {
      setTimeout(() => setProgress(p), delay);
    });

    setTimeout(() => {
      setUploadState("processing");
      setProgress(100);
    }, 2400);

    setTimeout(() => {
      setUploadState("success");
      setShowPreview(true);
    }, 3200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".csv"))) {
      simulateUpload(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) simulateUpload(selectedFile);
  };

  const resetUpload = () => {
    setUploadState("idle");
    setFile(null);
    setProgress(0);
    setShowPreview(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* Upload instructions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { icon: Download, title: "Download Template", desc: "Get the official import template", color: "text-primary", bg: "bg-primary/10" },
          { icon: FileSpreadsheet, title: "Fill Your Data", desc: "Fill member data in the template", color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
          { icon: Upload, title: "Upload File", desc: "Drop or select your filled file", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", step.bg)}>
              <step.icon className={cn("w-4.5 h-4.5", step.color)} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{step.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-[10px] w-5 h-5 p-0 flex items-center justify-center rounded-full">
              {i + 1}
            </Badge>
          </div>
        ))}
      </motion.div>

      {/* Main upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h3 className="font-semibold text-sm text-foreground">Upload Member Data</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Supported formats: XLSX, CSV (max 10MB)</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {uploadState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={handleFileInput}
                />

                <motion.div
                  animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <Upload className="w-8 h-8 text-primary" />
                </motion.div>

                <h4 className="text-base font-bold text-foreground mb-2">
                  {isDragging ? "Drop your file here" : "Drag & drop your file"}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  or <span className="text-primary font-semibold cursor-pointer hover:underline">browse to upload</span>
                </p>

                <div className="flex items-center justify-center gap-3">
                  <Badge variant="outline" className="text-xs gap-1">
                    <FileSpreadsheet className="w-3 h-3" /> .XLSX
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <File className="w-3 h-3" /> .CSV
                  </Badge>
                  <Badge variant="secondary" className="text-xs">Max 10MB</Badge>
                </div>
              </motion.div>
            )}

            {(uploadState === "uploading" || uploadState === "processing") && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border border-border rounded-2xl p-8 bg-muted/20"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{file?.name}</p>
                    <p className="text-xs text-muted-foreground">{file ? formatBytes(file.size) : ""}</p>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      uploadState === "processing"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    {uploadState === "processing" ? "Processing..." : "Uploading..."}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {uploadState === "processing" ? "Validating & processing records..." : "Uploading file..."}
                    </span>
                    <span className="font-semibold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="mt-4 space-y-1.5">
                  {[
                    { label: "File validation", done: progress > 20 },
                    { label: "Parsing data", done: progress > 50 },
                    { label: "Checking duplicates", done: progress > 75 },
                    { label: "Preparing preview", done: progress >= 100 },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                        step.done ? "bg-green-100 dark:bg-green-900/40" : "bg-muted"
                      )}>
                        {step.done && <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />}
                      </div>
                      <span className={step.done ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {uploadState === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-green-200 dark:border-green-800 rounded-2xl p-6 bg-green-50 dark:bg-green-950/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">Import Successful!</p>
                    <p className="text-xs text-green-600 dark:text-green-400/70">{file?.name} · {MOCK_PREVIEW_DATA.length} records ready</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetUpload}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-xs text-green-700 dark:text-green-400">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {MOCK_PREVIEW_DATA.length} valid records</span>
                  <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-500" /> 0 duplicates</span>
                  <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-destructive" /> 0 errors</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview table */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border"
            >
              <div className="px-6 py-3 bg-muted/30 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Data Preview (first 5 rows)</p>
                <Button size="sm" className="h-7 text-xs gap-1.5 bg-primary hover:bg-primary/90">
                  Confirm Import ({MOCK_PREVIEW_DATA.length} records)
                  {/* FUTURE BACKEND INTEGRATION — Excel Import Processing */}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      {["Serial #", "Name", "Father Name", "Gender", "Area"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PREVIEW_DATA.map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="px-4 py-2.5 font-mono font-medium text-primary">{row.serial}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{row.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{row.father}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={cn(
                            "text-[10px] h-4 px-1.5 border-0",
                            row.gender === "Male" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                          )}>
                            {row.gender}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="bg-teal-50 text-teal-700 text-[10px] px-1.5 py-0.5 rounded font-medium">{row.area}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
