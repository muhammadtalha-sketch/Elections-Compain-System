"use client";

import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  type ParsedFile,
  type DbField,
  DB_FIELD_LABELS,
  DB_FIELDS_ORDERED,
  getSampleValues,
} from "@/services/importService";
import { cn } from "@/lib/utils";

interface MappingStepProps {
  parsed:   ParsedFile;
  mapping:  Record<string, DbField>;
  onChange: (header: string, field: DbField) => void;
}

const REQUIRED_DB_FIELDS: DbField[] = ["name"];
const IMPORTANT_DB_FIELDS: DbField[] = ["serial_number", "name", "father_name", "gender", "phone_number", "registration_date"];

export function MappingStep({ parsed, mapping, onChange }: MappingStepProps) {
  const { headers, rawRows } = parsed;

  // Count how many columns are actually mapped (not skipped)
  const mappedCount  = headers.filter((h) => mapping[h] !== "__skip__").length;
  const skippedCount = headers.length - mappedCount;

  // Check if name is mapped
  const nameMapped = Object.values(mapping).includes("name");

  return (
    <div className="space-y-5">
      {/* Header info bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          <span>Match your file columns to database fields. Unneeded columns can be skipped.</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary">{parsed.totalRows.toLocaleString()} rows</Badge>
          <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30">{mappedCount} mapped</Badge>
          {skippedCount > 0 && (
            <Badge variant="outline" className="text-muted-foreground">{skippedCount} skipped</Badge>
          )}
        </div>
      </div>

      {/* Name field warning */}
      {!nameMapped && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300"
        >
          <span className="text-base">⚠️</span>
          <span><strong>Name</strong> field is required — please map one column to "Name".</span>
        </motion.div>
      )}

      {/* Mapping table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_36px_1fr] gap-0 px-5 py-3 bg-muted/30 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Uploaded Column</span>
          <span />
          <span>Database Field</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/60">
          {headers.map((header, i) => {
            const samples  = getSampleValues(rawRows, header);
            const current  = mapping[header] ?? "__skip__";
            const isSkipped = current === "__skip__";
            const isRequired = REQUIRED_DB_FIELDS.includes(current);
            const isImportant = IMPORTANT_DB_FIELDS.includes(current);

            return (
              <motion.div
                key={header}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.035 }}
                className={cn(
                  "grid grid-cols-[1fr_36px_1fr] items-center gap-0 px-5 py-3.5 transition-colors",
                  isSkipped ? "opacity-55" : "hover:bg-muted/20"
                )}
              >
                {/* Left: file column */}
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground truncate">{header}</span>
                    {isRequired && (
                      <Badge className="text-[9px] h-4 px-1.5 bg-destructive/10 text-destructive border-0 flex-shrink-0">
                        required
                      </Badge>
                    )}
                    {!isRequired && isImportant && !isSkipped && (
                      <Badge className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-0 flex-shrink-0">
                        key field
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {samples.length > 0
                      ? samples.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono max-w-[120px] truncate"
                          >
                            {s}
                          </span>
                        ))
                      : <span className="text-[10px] text-muted-foreground/50 italic">no sample data</span>
                    }
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className={cn("w-3.5 h-3.5 flex-shrink-0", isSkipped ? "text-border" : "text-primary")} />
                </div>

                {/* Right: DB field select */}
                <div className="pl-3">
                  <Select
                    value={current}
                    onValueChange={(v) => onChange(header, (v ?? "__skip__") as DbField)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-8 text-xs w-full",
                        isSkipped && "text-muted-foreground border-dashed",
                        isRequired && "border-destructive/60"
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DB_FIELDS_ORDERED.map((field) => (
                        <SelectItem key={field} value={field} className="text-xs">
                          {DB_FIELD_LABELS[field]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom tip */}
      <p className="text-[10px] text-muted-foreground text-center">
        Fields set to <em>"Skip this column"</em> will not be imported. Auto-mapping pre-fills common column names.
      </p>
    </div>
  );
}
