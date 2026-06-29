"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  CheckCircle2, User, Hash, Calendar, Phone, MapPin, Flag,
  FileText, Loader2, AlertCircle, RefreshCw, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { addMember, getNextSerialNumber, getDistinctAreas, getDistinctBars } from "@/services/memberService";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface FormData {
  name:             string;
  fatherName:       string;
  dob:              string;
  phone:            string;
  address:          string;
  city:             string;
  registrationDate: string;
  remarks:          string;
}

interface SavedMember {
  id:           string;
  serialNumber: number;
  name:         string;
  regDate:      string;
}

// ─────────────────────────────────────────────────────────────────────────────

export function AddMemberForm() {
  const today = new Date().toISOString().slice(0, 10);
  const { profile } = useAuth();

  // form state
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { city: "Sialkot", registrationDate: today },
  });

  // controlled selects
  const [gender,    setGender]    = useState("");
  const [area,      setArea]      = useState("");
  const [memberBar, setMemberBar] = useState("");

  // area combobox
  const [areaQuery,  setAreaQuery]  = useState("");
  const [areaOpen,   setAreaOpen]   = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  // dropdown data
  const [areas, setAreas] = useState<string[]>([]);
  const [bars,  setBars]  = useState<string[]>(["HC", "LC"]);

  // serial preview
  const [nextSerial,        setNextSerial]        = useState<number | null>(null);
  const [serialLoading,     setSerialLoading]     = useState(true);
  const [serialError,       setSerialError]       = useState(false);

  // submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved,        setSaved]        = useState<SavedMember | null>(null);

  // ── Load dropdown data + next serial on mount ──────────────────────────────
  useEffect(() => {
    getDistinctAreas().then(setAreas).catch(() => {});
    getDistinctBars().then((b) => { if (b.length) setBars(b); }).catch(() => {});

    setSerialLoading(true);
    getNextSerialNumber()
      .then((n) => { setNextSerial(n); setSerialError(false); })
      .catch(() => setSerialError(true))
      .finally(() => setSerialLoading(false));
  }, []);

  // Close area dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        setAreaOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // filtered area suggestions
  const filteredAreas = areaQuery.trim()
    ? areas.filter((a) => a.toLowerCase().includes(areaQuery.toLowerCase()))
    : areas;

  const selectArea = (val: string) => {
    setArea(val);
    setAreaQuery(val);
    setAreaOpen(false);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    if (!gender) { toast.error("Please select a gender"); return; }

    setIsSubmitting(true);
    try {
      const result = await addMember({
        serialNumber:     String(nextSerial ?? ""),
        name:             data.name,
        fatherName:       data.fatherName,
        gender:           gender as "Male" | "Female",
        dob:              data.dob || "",
        birthYear:        data.dob ? parseInt(data.dob.slice(0, 4)) : 0,
        address:          data.address,
        area:             area || areaQuery || "",
        city:             data.city || "Sialkot",
        phoneNumber:      data.phone,
        requestMemberBar: memberBar,
        registrationDate: data.registrationDate,
        status:           "Active",
        remarks:          data.remarks || "",
      }, profile?.full_name ?? null);

      setSaved({
        id:           result.id,
        serialNumber: result.serialNumber,
        name:         data.name,
        regDate:      data.registrationDate,
      });

      toast.success(`${data.name} registered`, {
        description: `Serial #${result.serialNumber} · ${data.registrationDate}`,
      });
    } catch (err: unknown) {
      toast.error("Failed to register member", {
        description: (err as Error).message ?? "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    reset({ city: "Sialkot", registrationDate: today });
    setGender("");
    setArea("");
    setAreaQuery("");
    setMemberBar("");
    setSaved(null);
    // Re-fetch next serial
    setSerialLoading(true);
    getNextSerialNumber()
      .then((n) => { setNextSerial(n); setSerialError(false); })
      .catch(() => setSerialError(true))
      .finally(() => setSerialLoading(false));
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-12 shadow-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </motion.div>

        <h3 className="text-xl font-bold text-foreground mb-2">Member Registered!</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Successfully added to Supabase.
        </p>

        <div className="inline-flex flex-col gap-2 text-left bg-muted/50 rounded-xl px-5 py-4 mb-8 min-w-[240px]">
          <Row label="Name"   value={saved.name} />
          <Row label="Serial" value={`#${saved.serialNumber}`} mono />
          <Row label="Date"   value={saved.regDate} mono />
          <Row label="ID"     value={saved.id.slice(0, 12) + "…"} mono small />
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button onClick={handleAddAnother} variant="outline" size="sm">
            Add Another Member
          </Button>
          <a href="/dashboard/members">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              View Members
            </Button>
          </a>
        </div>
      </motion.div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/20">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">New Member Registration</h3>
          <p className="text-xs text-muted-foreground">Fields marked <span className="text-destructive">*</span> are required</p>
        </div>

        {/* Next serial preview */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
          {serialLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          ) : serialError ? (
            <button type="button" onClick={() => { setSerialLoading(true); getNextSerialNumber().then(setNextSerial).catch(() => setSerialError(true)).finally(() => setSerialLoading(false)); }}>
              <AlertCircle className="w-3.5 h-3.5 text-destructive" aria-label="Failed to load serial" />
            </button>
          ) : (
            <Badge variant="secondary" className="font-mono text-xs">
              Next: #{nextSerial}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-7">

        {/* ── Section 1: Identity ──────────────────────────────── */}
        <Section label="Identity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required error={errors.name?.message}>
              <Input
                {...register("name", { required: "Full name is required", minLength: { value: 2, message: "Min 2 characters" } })}
                placeholder="Muhammad Ali"
                className={cn("h-9 text-sm", errors.name && "border-destructive")}
              />
            </Field>
            <Field label="Father / Guardian Name" error={errors.fatherName?.message}>
              <Input
                {...register("fatherName")}
                placeholder="Muhammad Hassan"
                className="h-9 text-sm"
              />
            </Field>
          </div>
        </Section>

        {/* ── Section 2: Registration ──────────────────────────── */}
        <Section label="Registration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Registration Date" required error={errors.registrationDate?.message}>
              <Input
                type="date"
                {...register("registrationDate", { required: "Registration date is required" })}
                className={cn("h-9 text-sm", errors.registrationDate && "border-destructive")}
              />
            </Field>
            <Field label="Member Bar">
              <Select value={memberBar} onValueChange={(v) => setMemberBar(v ?? "")}>
                <SelectTrigger className={cn("h-9 text-sm", !memberBar && "text-muted-foreground")}>
                  <SelectValue placeholder="Select bar (HC / LC)" />
                </SelectTrigger>
                <SelectContent>
                  {bars.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        {/* ── Section 3: Personal ─────────────────────────────── */}
        <Section label="Personal Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Gender" required>
              <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
                <SelectTrigger className={cn("h-9 text-sm", !gender && "text-muted-foreground border-destructive ring-0")}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date of Birth" error={errors.dob?.message}>
              <Input
                type="date"
                {...register("dob")}
                className="h-9 text-sm"
              />
            </Field>
            <Field label="Phone Number" error={errors.phone?.message}>
              <Input
                type="tel"
                {...register("phone", {
                  pattern: {
                    value: /^(\+92|0)?[0-9]{9,11}$/,
                    message: "Enter a valid Pakistani number",
                  },
                })}
                placeholder="03001234567"
                className={cn("h-9 text-sm font-mono", errors.phone && "border-destructive")}
              />
            </Field>
          </div>
        </Section>

        {/* ── Section 4: Location ─────────────────────────────── */}
        <Section label="Location">
          <div className="space-y-4">
            <Field label="Full Address" error={errors.address?.message}>
              <Input
                {...register("address")}
                placeholder="House #5, Street #3, Model Town, Sialkot"
                className="h-9 text-sm"
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Area — native combobox with datalist + manual override */}
              <Field label="Area">
                <div className="relative" ref={areaRef}>
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    value={areaQuery}
                    onChange={(e) => {
                      setAreaQuery(e.target.value);
                      setArea(e.target.value);
                      setAreaOpen(true);
                    }}
                    onFocus={() => setAreaOpen(true)}
                    placeholder="Type or select area…"
                    className="h-9 text-sm pl-9 pr-8"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setAreaOpen((o) => !o)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <AnimatePresence>
                    {areaOpen && filteredAreas.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg text-xs"
                      >
                        {filteredAreas.map((a) => (
                          <li
                            key={a}
                            onMouseDown={(e) => { e.preventDefault(); selectArea(a); }}
                            className={cn(
                              "px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              area === a && "bg-primary/10 text-primary font-semibold"
                            )}
                          >
                            {a}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </Field>

              <Field label="City" error={errors.city?.message}>
                <Input
                  {...register("city")}
                  placeholder="Sialkot"
                  className="h-9 text-sm"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* ── Section 5: Remarks ──────────────────────────────── */}
        <Section label="Additional Notes">
          <Field label="Remarks / Notes">
            <Textarea
              {...register("remarks")}
              placeholder="Any additional information about this member…"
              className="text-sm resize-none h-20"
            />
          </Field>
        </Section>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
        <Button
          type="submit"
          disabled={isSubmitting || serialLoading || serialError}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving to Supabase…
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Register Member
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset({ city: "Sialkot", registrationDate: today });
            setGender(""); setArea(""); setAreaQuery(""); setMemberBar("");
          }}
          disabled={isSubmitting}
        >
          Clear Form
        </Button>

        {serialError && (
          <button
            type="button"
            onClick={() => { setSerialLoading(true); setSerialError(false); getNextSerialNumber().then(setNextSerial).catch(() => setSerialError(true)).finally(() => setSerialLoading(false)); }}
            className="flex items-center gap-1 text-xs text-destructive hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Retry serial
          </button>
        )}

        <p className="ml-auto text-[10px] text-muted-foreground">
          Sialkot Campaign · Supabase
        </p>
      </div>
    </motion.form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </div>
  );
}

function Field({
  label, required = false, error, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value, mono = false, small = false }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn("text-xs font-semibold text-foreground", mono && "font-mono", small && "text-[10px]")}>{value}</span>
    </div>
  );
}
