"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, File, CheckCircle2, XCircle, FileSpreadsheet,
  X, AlertCircle, Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { bulkImportMembers, FirestoreMember } from "@/services/memberService";

type UploadState = "idle" | "parsing" | "previewing" | "importing" | "success" | "error";

interface PreviewRow {
  serial: string;
  name: string;
  father: string;
  gender: string;
  area: string;
  dob: string;
  phone: string;
  address: string;
  requestMemberBar: string;
  registrationDate: string;
}

function parseWorkbook(file: File): Promise<PreviewRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const mapped: PreviewRow[] = rows.map((r) => ({
          serial: String(r["Serial Number"] ?? r["serial"] ?? r["SerialNumber"] ?? ""),
          name: String(r["Name"] ?? r["name"] ?? ""),
          father: String(r["Father Name"] ?? r["fatherName"] ?? r["Father"] ?? ""),
          gender: String(r["Gender"] ?? r["gender"] ?? ""),
          area: String(r["Area"] ?? r["area"] ?? ""),
          dob: String(r["DOB"] ?? r["Date of Birth"] ?? r["dob"] ?? ""),
          phone: String(r["Phone"] ?? r["phone"] ?? r["Phone Number"] ?? ""),
          address: String(r["Address"] ?? r["address"] ?? ""),
          requestMemberBar: String(r["Member Bar"] ?? r["requestMemberBar"] ?? ""),
          registrationDate: String(r["Registration Date"] ?? r["registrationDate"] ?? new Date().toISOString().slice(0, 10)),
        })).filter((r) => r.serial && r.name);
        resolve(mapped);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function ImportUploader() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [allRows, setAllRows] = useState<PreviewRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; errors: string[] } | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setUploadState("parsing");
    setProgress(0);
    setPreviewRows([]);
    setAllRows([]);
    setImportResult(null);

    try {
      const rows = await parseWorkbook(f);
      setAllRows(rows);
      setPreviewRows(rows.slice(0, 5));
      setUploadState("previewing");
    } catch (err: unknown) {
      toast.error("Failed to parse file", { description: (err as Error).message });
      setUploadState("error");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".csv"))) {
      handleFile(f);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleConfirmImport = async () => {
    setUploadState("importing");
    setProgress(0);
    try {
      const members: Omit<FirestoreMember, "id" | "createdAt" | "updatedAt">[] = allRows.map((r) => ({
        serialNumber: r.serial,
        name: r.name,
        fatherName: r.father,
        gender: (r.gender === "Female" ? "Female" : "Male") as "Male" | "Female",
        dob: r.dob || "1990-01-01",
        birthYear: parseInt(r.dob?.split("-")[0] ?? "1990"),
        address: r.address,
        area: r.area,
        city: "Sialkot",
        phoneNumber: r.phone,
        requestMemberBar: r.requestMemberBar,
        registrationDate: r.registrationDate,
        status: "Active",
      }));

      const result = await bulkImportMembers(members, (done, total) => {
        setProgress(Math.round((done / total) * 100));
      });

      setImportResult(result);
      setUploadState("success");
      toast.success(`Import complete: ${result.inserted} members added`, {
        description: result.errors.length > 0 ? `${result.errors.length} batch errors occurred.` : undefined,
      });
    } catch (err: unknown) {
      toast.error("Import failed", { description: (err as Error).message });
      setUploadState("error");
    }
  };

  const resetUpload = () => {
    setUploadState("idle");
    setFile(null);
    setProgress(0);
    setPreviewRows([]);
    setAllRows([]);
    setImportResult(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      {/* Steps */}
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
              <step.icon className={cn("w-4 h-4", step.color)} />
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

      {/* Upload zone */}
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
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input id="file-input" type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileInput} />
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
                  or <span className="text-primary font-semibold hover:underline">browse to upload</span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Badge variant="outline" className="text-xs gap-1"><FileSpreadsheet className="w-3 h-3" /> .XLSX</Badge>
                  <Badge variant="outline" className="text-xs gap-1"><File className="w-3 h-3" /> .CSV</Badge>
                  <Badge variant="secondary" className="text-xs">Max 10MB</Badge>
                </div>
              </motion.div>
            )}

            {uploadState === "parsing" && (
              <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="border border-border rounded-2xl p-8 bg-muted/20 flex flex-col items-center gap-4"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full"
                />
                <p className="text-sm font-semibold text-foreground">Parsing {file?.name}…</p>
                <p className="text-xs text-muted-foreground">Reading and validating rows</p>
              </motion.div>
            )}

            {uploadState === "importing" && (
              <motion.div key="importing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="border border-border rounded-2xl p-8 bg-muted/20"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{file?.name}</p>
                    <p className="text-xs text-muted-foreground">{allRows.length} records · {file ? formatBytes(file.size) : ""}</p>
                  </div>
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Importing…</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Writing to Supabase…</span>
                    <span className="font-semibold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </motion.div>
            )}

            {uploadState === "success" && importResult && (
              <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="border border-green-200 dark:border-green-800 rounded-2xl p-6 bg-green-50 dark:bg-green-950/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">Import Successful!</p>
                    <p className="text-xs text-green-600 dark:text-green-400/70">{file?.name} · {importResult.inserted} records saved to Supabase</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetUpload}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-green-700 dark:text-green-400">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {importResult.inserted} inserted</span>
                  <span className="flex items-center gap-1"><XCircle className={cn("w-3 h-3", importResult.errors.length > 0 ? "text-destructive" : "")} /> {importResult.errors.length} errors</span>
                </div>
              </motion.div>
            )}

            {uploadState === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="border border-destructive/30 rounded-2xl p-6 bg-destructive/5 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-foreground flex-1">Import failed. Check the file format and try again.</p>
                <Button size="sm" variant="outline" onClick={resetUpload}>Try Again</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview table */}
        <AnimatePresence>
          {uploadState === "previewing" && previewRows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border"
            >
              <div className="px-6 py-3 bg-muted/30 flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">
                  Data Preview — {allRows.length} records found (showing first 5)
                </p>
                <Button
                  size="sm"
                  onClick={handleConfirmImport}
                  className="h-7 text-xs gap-1.5 bg-primary hover:bg-primary/90"
                >
                  Confirm Import ({allRows.length} records)
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
                    {previewRows.map((row, i) => (
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
                            row.gender === "Female" ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"
                          )}>
                            {row.gender || "Male"}
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
