/**
 * importService.ts
 *
 * All logic for the Excel / CSV import wizard:
 *   parseFile → autoMapColumns → validateRows → checkDuplicates → executeBulkImport
 */

import * as XLSX from "xlsx";
import { createBrowserClient } from "@supabase/ssr";
import { resolveArea } from "@/lib/area-utils";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbField =
  | "serial_number"
  | "name"
  | "father_name"
  | "gender"
  | "dob"
  | "birth_year"
  | "address"
  | "area"
  | "city"
  | "phone_number"
  | "request_member_bar"
  | "registration_date"
  | "remarks"
  | "__skip__";

export const DB_FIELD_LABELS: Record<DbField, string> = {
  serial_number:        "Serial Number",
  name:                 "Name",
  father_name:          "Father's Name",
  gender:               "Gender",
  dob:                  "Date of Birth",
  birth_year:           "Birth Year",
  address:              "Address",
  area:                 "Area",
  city:                 "City",
  phone_number:         "Phone Number",
  request_member_bar:   "Member Bar",
  registration_date:    "Registration Date",
  remarks:              "Remarks / Notes",
  __skip__:             "— Skip this column —",
};

export const DB_FIELDS_ORDERED: DbField[] = [
  "__skip__",
  "serial_number", "name", "father_name",
  "gender", "dob", "birth_year",
  "address", "area", "city",
  "phone_number", "request_member_bar",
  "registration_date", "remarks",
];

export interface ParsedFile {
  headers:   string[];
  rawRows:   Record<string, string>[];  // all values as strings
  totalRows: number;
  fileName:  string;
  fileSize:  number;
}

export interface ValidatedRow {
  rowIndex:        number;
  raw:             Record<string, string>;
  errors:          string[];
  warnings:        string[];
  isDuplicate:     boolean;
  duplicateReason: string;
}

export type DuplicateAction = "skip" | "update" | "import";

export interface ImportOptions {
  duplicateAction: DuplicateAction;
  batchSize:       number;
  onProgress:      (done: number, total: number, errors: number) => void;
}

export interface RowError {
  rowIndex: number;
  name:     string;
  field:    string;
  message:  string;
}

export interface ImportResult {
  inserted:    number;
  skipped:     number;
  updated:     number;
  rowErrors:   RowError[];
  batchErrors: string[];
}

// ─── Parse File ───────────────────────────────────────────────────────────────

export function parseFile(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read the file."));

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, {
          defval:  "",
          raw:     false,   // format dates as strings
          dateNF:  "yyyy-mm-dd",
        });

        if (rawJson.length === 0) {
          reject(new Error("The file is empty or has no data rows."));
          return;
        }

        const headers = Object.keys(rawJson[0]).map((h) => h.trim());
        const rawRows: Record<string, string>[] = rawJson.map((row) => {
          const out: Record<string, string> = {};
          for (const key of Object.keys(row)) {
            out[key.trim()] = String(row[key] ?? "").trim();
          }
          return out;
        });

        resolve({
          headers,
          rawRows,
          totalRows: rawRows.length,
          fileName:  file.name,
          fileSize:  file.size,
        });
      } catch (err: unknown) {
        reject(new Error((err as Error).message ?? "Failed to parse file."));
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

// ─── Auto-map columns ─────────────────────────────────────────────────────────

const AUTO_MAP_RULES: [RegExp, DbField][] = [
  // Serial / ID
  [/^(id|s\.?no\.?|sr\.?no\.?|serial\.?no\.?|serial\.?number|sr\.?)$/i, "serial_number"],
  // Name — exact only to avoid "Father Name" → name
  [/^name$/i, "name"],
  // Father Name
  [/father|guardian/i, "father_name"],
  // Gender
  [/^(gender|sex)$/i, "gender"],
  // DOB
  [/^(dob|d\.o\.b\.?|date.?of.?birth|birth.?date)$/i, "dob"],
  // Birth Year
  [/^(birth.?year|year.?of.?birth|yob)$/i, "birth_year"],
  // Address
  [/^(address|addr|residence|location)$/i, "address"],
  // Area
  [/^(area|locality|zone|sector|locality)$/i, "area"],
  // City
  [/^(city|town)$/i, "city"],
  // Phone
  [/^(phone|phone.?no\.?|phone.?number|mobile|contact|cell|tel\.?)$/i, "phone_number"],
  // Member Bar
  [/bar|bench|member.?bar|request.?bar/i, "request_member_bar"],
  // Registration Date
  [/^(date|reg.?date|registration.?date|joining.?date|enroll.?date|dated?)$/i, "registration_date"],
  // Remarks
  [/^(remarks?|notes?|comments?)$/i, "remarks"],
];

export function autoMapColumns(headers: string[]): Record<string, DbField> {
  const mapping: Record<string, DbField> = {};
  const used = new Set<DbField>();

  for (const header of headers) {
    let matched: DbField = "__skip__";
    for (const [pattern, field] of AUTO_MAP_RULES) {
      if (pattern.test(header.trim()) && !used.has(field)) {
        matched = field;
        used.add(field);
        break;
      }
    }
    mapping[header] = matched;
  }

  return mapping;
}

// ─── Date normalisation ───────────────────────────────────────────────────────

function normaliseDate(raw: string): string | null {
  if (!raw || raw === "0") return null;
  const s = raw.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;

  // MM/DD/YYYY
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, "0")}-${mdy[2].padStart(2, "0")}`;

  // Excel serial number (numeric)
  if (/^\d{4,6}$/.test(s)) {
    const serial = parseInt(s);
    if (serial > 40000 && serial < 80000) {
      const d = XLSX.SSF.parse_date_code(serial);
      if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    }
  }

  // Try native Date parse as last resort
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  return null;
}

function normaliseGender(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (["male", "m", "مرد"].includes(s)) return "Male";
  if (["female", "f", "woman", "عورت"].includes(s)) return "Female";
  if (["other", "o"].includes(s)) return "Other";
  return raw.trim() || null;
}

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()]/g, "");
  if (!digits) return null;
  return digits;
}

// ─── Get mapped value from a raw row ─────────────────────────────────────────

function getMapped(
  raw: Record<string, string>,
  mapping: Record<string, DbField>,
  field: DbField
): string {
  for (const [header, mapped] of Object.entries(mapping)) {
    if (mapped === field) return raw[header] ?? "";
  }
  return "";
}

// ─── Validate rows ────────────────────────────────────────────────────────────

export function validateRows(
  rawRows:  Record<string, string>[],
  mapping:  Record<string, DbField>
): ValidatedRow[] {
  const serialsSeen = new Set<string>();

  return rawRows.map((raw, i) => {
    const errors:   string[] = [];
    const warnings: string[] = [];

    const name   = getMapped(raw, mapping, "name");
    const gender = getMapped(raw, mapping, "gender");
    const serial = getMapped(raw, mapping, "serial_number");
    const dob    = getMapped(raw, mapping, "dob");
    const regDate= getMapped(raw, mapping, "registration_date");
    const phone  = getMapped(raw, mapping, "phone_number");

    if (!name) errors.push("Missing Name");

    if (gender && !["Male", "Female", "Other", "M", "F"].includes(gender.trim())) {
      warnings.push(`Unusual gender: "${gender}"`);
    }

    if (dob) {
      const normalised = normaliseDate(dob);
      if (!normalised) errors.push(`Invalid date format: "${dob}"`);
    }

    if (regDate) {
      const normalised = normaliseDate(regDate);
      if (!normalised) warnings.push(`Invalid registration date: "${regDate}"`);
    }

    // Duplicate within file
    if (serial) {
      if (serialsSeen.has(serial)) {
        errors.push(`Duplicate serial in file: ${serial}`);
      } else {
        serialsSeen.add(serial);
      }
    }

    if (phone && phone.replace(/\D/g, "").length < 7) {
      warnings.push("Phone number looks short");
    }

    return {
      rowIndex:        i + 2,  // row 1 = header, so data starts at row 2
      raw,
      errors,
      warnings,
      isDuplicate:     false,
      duplicateReason: "",
    };
  });
}

// ─── Duplicate detection ──────────────────────────────────────────────────────

export async function checkDuplicates(
  rows:    ValidatedRow[],
  mapping: Record<string, DbField>
): Promise<ValidatedRow[]> {
  const serials: number[] = [];
  const phones:  string[] = [];

  for (const row of rows) {
    const s = getMapped(row.raw, mapping, "serial_number");
    const p = normalisePhone(getMapped(row.raw, mapping, "phone_number"));
    if (s && !isNaN(parseInt(s))) serials.push(parseInt(s));
    if (p) phones.push(p);
  }

  // Batch check against Supabase
  const existingSerials = new Set<number>();
  const existingPhones  = new Set<string>();

  if (serials.length > 0) {
    const { data } = await supabase
      .from("members")
      .select("serial_number")
      .in("serial_number", serials);
    (data ?? []).forEach((r) => existingSerials.add(r.serial_number));
  }

  if (phones.length > 0) {
    const { data } = await supabase
      .from("members")
      .select("phone_number")
      .in("phone_number", phones);
    (data ?? []).forEach((r) => { if (r.phone_number) existingPhones.add(r.phone_number); });
  }

  return rows.map((row) => {
    const s = getMapped(row.raw, mapping, "serial_number");
    const p = normalisePhone(getMapped(row.raw, mapping, "phone_number"));

    let isDuplicate     = false;
    let duplicateReason = "";

    if (s && existingSerials.has(parseInt(s))) {
      isDuplicate     = true;
      duplicateReason = `Serial #${s} already exists`;
    } else if (p && existingPhones.has(p)) {
      isDuplicate     = true;
      duplicateReason = `Phone ${p} already exists`;
    }

    return { ...row, isDuplicate, duplicateReason };
  });
}

// ─── Build DB row from validated row + mapping ────────────────────────────────

function buildDbRow(
  row:         ValidatedRow,
  mapping:     Record<string, DbField>,
  serialNum:   number
): Record<string, unknown> {
  const get = (f: DbField) => getMapped(row.raw, mapping, f);

  const dobRaw     = get("dob");
  const regDateRaw = get("registration_date");
  const phone      = normalisePhone(get("phone_number"));
  const gender     = normaliseGender(get("gender"));
  const dobDate    = normaliseDate(dobRaw);
  const regDate    = normaliseDate(regDateRaw) ?? new Date().toISOString().slice(0, 10);
  const address    = get("address") || null;
  const areaRaw    = get("area") || null;
  const area       = resolveArea(areaRaw, address) || areaRaw || null;

  // Birth year: from dob, or from birth_year column, or from dob string directly
  let birthYear: number | null = null;
  if (dobDate) {
    birthYear = parseInt(dobDate.slice(0, 4));
  } else {
    const byRaw = get("birth_year");
    if (byRaw && !isNaN(parseInt(byRaw))) birthYear = parseInt(byRaw);
  }

  return {
    serial_number:      serialNum,
    name:               (get("name") || "Unknown").trim(),
    father_name:        get("father_name").trim() || null,
    gender:             gender as "Male" | "Female" | "Other" | null,
    dob:                dobDate,
    birth_year:         birthYear,
    address,
    area,
    city:               get("city").trim() || "Sialkot",
    phone_number:       phone,
    request_member_bar: get("request_member_bar").trim() || null,
    registration_date:  regDate,
    remarks:            get("remarks").trim() || null,
  };
}

// ─── Execute bulk import ──────────────────────────────────────────────────────

export async function executeBulkImport(
  rows:    ValidatedRow[],
  mapping: Record<string, DbField>,
  options: ImportOptions
): Promise<ImportResult> {
  const { duplicateAction, batchSize, onProgress } = options;

  // Filter rows based on duplicate action
  const toInsert   = rows.filter((r) => !r.isDuplicate || duplicateAction === "import");
  const toUpsert   = rows.filter((r) => r.isDuplicate  && duplicateAction === "update");
  const toSkip     = rows.filter((r) => r.isDuplicate  && duplicateAction === "skip");

  const validInsert = toInsert.filter((r) => r.errors.length === 0);

  let inserted  = 0;
  let updated   = 0;
  const skipped  = toSkip.length;
  const rowErrors: RowError[] = [];
  const batchErrors: string[] = [];

  // Get next serial number
  const { data: startSerial } = await supabase.rpc("get_next_serial_number");
  let nextSerial = (startSerial as number) ?? 1;

  const processChunks = async (
    items: ValidatedRow[],
    mode:  "insert" | "upsert"
  ) => {
    for (let i = 0; i < items.length; i += batchSize) {
      const chunk = items.slice(i, i + batchSize);
      const dbRows = chunk.map((row) => {
        // If row has an explicit serial, use it; otherwise auto-assign
        const rawSerial = getMapped(row.raw, mapping, "serial_number");
        const useSerial = rawSerial && !isNaN(parseInt(rawSerial))
          ? parseInt(rawSerial)
          : nextSerial++;
        return buildDbRow(row, mapping, useSerial);
      });

      if (mode === "insert") {
        const { error } = await supabase.from("members").insert(dbRows);
        if (error) {
          batchErrors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += chunk.length;
        }
      } else {
        const { error } = await supabase
          .from("members")
          .upsert(dbRows, { onConflict: "serial_number" });
        if (error) {
          batchErrors.push(`Upsert batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          updated += chunk.length;
        }
      }

      onProgress(inserted + updated, rows.length, rowErrors.length + batchErrors.length);
    }
  };

  await processChunks(validInsert, "insert");
  if (toUpsert.length > 0) await processChunks(toUpsert, "upsert");

  // Collect row-level errors from validation
  rows
    .filter((r) => r.errors.length > 0)
    .forEach((r) => {
      const name = getMapped(r.raw, mapping, "name") || `Row ${r.rowIndex}`;
      r.errors.forEach((msg) => {
        rowErrors.push({ rowIndex: r.rowIndex, name, field: "", message: msg });
      });
    });

  return { inserted, skipped, updated, rowErrors, batchErrors };
}

// ─── Error report CSV download ────────────────────────────────────────────────

export function downloadErrorReport(
  errors:   RowError[],
  fileName: string
) {
  if (errors.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(
    errors.map((e) => ({
      "Row #":   e.rowIndex,
      "Name":    e.name,
      "Field":   e.field || "—",
      "Error":   e.message,
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Import Errors");

  const base = fileName.replace(/\.(xlsx?|csv)$/i, "");
  XLSX.writeFile(wb, `${base}_errors.csv`, { bookType: "csv" });
}

// ─── Get sample values for a column ──────────────────────────────────────────

export function getSampleValues(
  rows:   Record<string, string>[],
  header: string,
  count = 3
): string[] {
  const seen = new Set<string>();
  const out:  string[] = [];
  for (const row of rows) {
    const v = (row[header] ?? "").trim();
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
      if (out.length >= count) break;
    }
  }
  return out;
}
