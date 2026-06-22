"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { UploadStep } from "./steps/upload-step";
import { MappingStep } from "./steps/mapping-step";
import { PreviewStep, PreviewStepActions } from "./steps/preview-step";
import { ProgressStep } from "./steps/progress-step";
import { SuccessStep } from "./steps/success-step";

import {
  type ParsedFile,
  type ValidatedRow,
  type DbField,
  type ImportResult,
  type DuplicateAction,
  autoMapColumns,
  validateRows,
  checkDuplicates,
  executeBulkImport,
} from "@/services/importService";

// ─── Wizard step definitions ─────────────────────────────────────────────────

type StepId = "upload" | "mapping" | "preview" | "import" | "done";

interface Step {
  id:    StepId;
  label: string;
  short: string;
}

const STEPS: Step[] = [
  { id: "upload",  label: "Upload File",      short: "Upload"  },
  { id: "mapping", label: "Map Columns",       short: "Mapping" },
  { id: "preview", label: "Preview & Validate",short: "Preview" },
  { id: "import",  label: "Import",            short: "Import"  },
  { id: "done",    label: "Complete",          short: "Done"    },
];

const STEP_ORDER: StepId[] = ["upload", "mapping", "preview", "import", "done"];

// ─── Component ────────────────────────────────────────────────────────────────

export function ImportWizard() {
  const [step,            setStep]            = useState<StepId>("upload");
  const [parsed,          setParsed]          = useState<ParsedFile | null>(null);
  const [mapping,         setMapping]         = useState<Record<string, DbField>>({});
  const [validatedRows,   setValidatedRows]   = useState<ValidatedRow[]>([]);
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>("skip");
  const [importResult,    setImportResult]    = useState<ImportResult | null>(null);
  const [progress,        setProgress]        = useState({ done: 0, total: 0, errors: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const stepIndex = STEP_ORDER.indexOf(step);
  const isCompleted = (id: StepId) => STEP_ORDER.indexOf(id) < stepIndex;

  // ── Upload → Mapping ──────────────────────────────────────────────────────
  const handleParsed = useCallback((result: ParsedFile) => {
    setParsed(result);
    const auto = autoMapColumns(result.headers);
    setMapping(auto);
    // Small delay so the success badge in upload step is visible
    setTimeout(() => setStep("mapping"), 700);
  }, []);

  // ── Mapping → Preview ─────────────────────────────────────────────────────
  const handleMappingNext = useCallback(async () => {
    if (!parsed) return;

    const nameMapped = Object.values(mapping).includes("name");
    if (!nameMapped) {
      toast.error("Please map one column to Name before continuing.");
      return;
    }

    setIsTransitioning(true);
    setStep("preview");

    try {
      const initialRows = validateRows(parsed.rawRows, mapping);
      const rows        = await checkDuplicates(initialRows, mapping);
      setValidatedRows(rows);
    } catch (err: unknown) {
      toast.error("Validation failed", { description: (err as Error).message });
    } finally {
      setIsTransitioning(false);
    }
  }, [parsed, mapping]);

  // ── Preview → Import ──────────────────────────────────────────────────────
  const handleImport = useCallback(async () => {
    if (!parsed || validatedRows.length === 0) return;

    setStep("import");
    setProgress({ done: 0, total: validatedRows.length, errors: 0 });

    try {
      const result = await executeBulkImport(validatedRows, mapping, {
        duplicateAction,
        batchSize: 500,
        onProgress: (done, total, errors) => setProgress({ done, total, errors }),
      });

      setImportResult(result);
      setStep("done");

      const msg = result.inserted > 0
        ? `${result.inserted.toLocaleString()} records imported`
        : "No new records were inserted";

      toast.success("Import complete", {
        description: [
          msg,
          result.skipped > 0 && `${result.skipped} skipped`,
          result.updated > 0 && `${result.updated} updated`,
        ].filter(Boolean).join(" · "),
      });
    } catch (err: unknown) {
      toast.error("Import failed", { description: (err as Error).message });
      setStep("preview");
    }
  }, [parsed, validatedRows, mapping, duplicateAction]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setStep("upload");
    setParsed(null);
    setMapping({});
    setValidatedRows([]);
    setImportResult(null);
    setProgress({ done: 0, total: 0, errors: 0 });
    setDuplicateAction("skip");
  }, []);

  // ── Mapping field change ───────────────────────────────────────────────────
  const handleMappingChange = useCallback((header: string, field: DbField) => {
    setMapping((prev) => ({ ...prev, [header]: field }));
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Stepper */}
      {step !== "done" && (
        <div className="bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center">
            {STEPS.filter((s) => s.id !== "done").map((s, i, arr) => {
              const isActive    = s.id === step;
              const isDone      = isCompleted(s.id);
              const isLast      = i === arr.length - 1;

              return (
                <div key={s.id} className="flex items-center flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Circle */}
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300",
                      isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                      isDone   && "bg-emerald-500 text-white",
                      !isActive && !isDone && "bg-muted text-muted-foreground"
                    )}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                    </div>

                    {/* Label (hidden on small screens for non-active steps) */}
                    <span className={cn(
                      "text-xs font-semibold hidden sm:block whitespace-nowrap",
                      isActive && "text-foreground",
                      isDone   && "text-emerald-600 dark:text-emerald-400",
                      !isActive && !isDone && "text-muted-foreground"
                    )}>
                      {s.short}
                    </span>
                  </div>

                  {/* Connector */}
                  {!isLast && (
                    <div className={cn(
                      "flex-1 h-px mx-3 transition-all duration-300",
                      STEP_ORDER.indexOf(s.id) < stepIndex ? "bg-emerald-400" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Step header */}
        {step !== "import" && step !== "done" && (
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-foreground">
              {STEPS.find((s) => s.id === step)?.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === "upload"  && "Upload your Excel or CSV file to begin"}
              {step === "mapping" && "Tell us which file column maps to which database field"}
              {step === "preview" && "Review detected issues before importing"}
            </p>
          </div>
        )}

        <div className={cn(
          "p-6",
          step === "import" && "p-0",
          step === "done"   && "p-6"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {step === "upload" && (
                <UploadStep onParsed={handleParsed} />
              )}

              {step === "mapping" && parsed && (
                <MappingStep
                  parsed={parsed}
                  mapping={mapping}
                  onChange={handleMappingChange}
                />
              )}

              {step === "preview" && (
                isTransitioning ? (
                  <div className="flex flex-col items-center gap-4 py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Validating rows & checking for duplicates…</p>
                  </div>
                ) : (
                  <PreviewStep
                    rows={validatedRows}
                    mapping={mapping}
                    duplicateAction={duplicateAction}
                    onDuplicateActionChange={setDuplicateAction}
                  />
                )
              )}

              {step === "import" && parsed && (
                <ProgressStep
                  done={progress.done}
                  total={progress.total}
                  errors={progress.errors}
                  fileName={parsed.fileName}
                />
              )}

              {step === "done" && importResult && parsed && (
                <SuccessStep
                  result={importResult}
                  fileName={parsed.fileName}
                  onReset={handleReset}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {(step === "mapping" || step === "preview") && (
          <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
            {/* Back */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step === "mapping" ? "upload" : "mapping")}
              disabled={isTransitioning}
            >
              Back
            </Button>

            {/* Forward */}
            {step === "mapping" && (
              <Button
                size="sm"
                onClick={handleMappingNext}
                disabled={isTransitioning}
                className="gap-1.5 bg-primary hover:bg-primary/90"
              >
                {isTransitioning
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Validating…</>
                  : <><span>Continue to Preview</span><ChevronRight className="w-3.5 h-3.5" /></>
                }
              </Button>
            )}

            {step === "preview" && !isTransitioning && (
              <PreviewStepActions
                rows={validatedRows}
                mapping={mapping}
                onNext={handleImport}
              />
            )}

            {/* Column count hint */}
            {step === "mapping" && parsed && (
              <p className="ml-auto text-[10px] text-muted-foreground">
                {Object.values(mapping).filter((v) => v !== "__skip__").length} of {parsed.headers.length} columns mapped
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
