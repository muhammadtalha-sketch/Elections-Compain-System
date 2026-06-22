"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  CheckCircle2, User, Hash, Calendar, Phone, MapPin, Flag, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ALL_AREAS, ALL_REQUEST_MEMBER_BARS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface FormData {
  serialNumber: string;
  name: string;
  fatherName: string;
  gender: string;
  dob: string;
  address: string;
  area: string;
  phone: string;
  requestMemberBar: string;
  registrationDate: string;
}

const FIELD_GROUPS = [
  {
    title: "Basic Information",
    icon: User,
    color: "text-primary",
    bg: "bg-primary/10",
    fields: ["serialNumber", "name", "fatherName", "gender"],
  },
  {
    title: "Personal Details",
    icon: Calendar,
    color: "text-violet-600",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    fields: ["dob", "phone"],
  },
  {
    title: "Location",
    icon: MapPin,
    color: "text-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    fields: ["address", "area"],
  },
  {
    title: "Campaign Details",
    icon: Flag,
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    fields: ["requestMemberBar", "registrationDate"],
  },
];

export function AddMemberForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState("");
  const [area, setArea] = useState("");
  const [memberBar, setMemberBar] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // TODO: Backend Integration — MongoDB API Connection
    // TODO: POST /api/members with JWT auth header
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    reset();
    setGender("");
    setArea("");
    setMemberBar("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
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
        <p className="text-sm text-muted-foreground mb-6">
          The member has been successfully added to the system.
          {/* FUTURE BACKEND INTEGRATION — MongoDB API Connection */}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={handleReset} variant="outline" size="sm">
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

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">New Member Registration</h3>
            <p className="text-xs text-muted-foreground">Fill in all required fields marked with *</p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">
            Sialkot Campaign 2024
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Serial Number & Registration Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              <Hash className="inline w-3 h-3 mr-1" />
              Serial Number <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("serialNumber", { required: "Serial number is required" })}
              placeholder="SLK-0001"
              className={cn("h-9 text-sm font-mono", errors.serialNumber && "border-destructive")}
            />
            {errors.serialNumber && (
              <p className="text-[10px] text-destructive mt-1">{errors.serialNumber.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              <Calendar className="inline w-3 h-3 mr-1" />
              Registration Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              {...register("registrationDate", { required: "Date is required" })}
              className={cn("h-9 text-sm", errors.registrationDate && "border-destructive")}
            />
            {errors.registrationDate && (
              <p className="text-[10px] text-destructive mt-1">{errors.registrationDate.message}</p>
            )}
          </div>
        </div>

        {/* Name & Father Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              <User className="inline w-3 h-3 mr-1" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })}
              placeholder="Muhammad Ali"
              className={cn("h-9 text-sm", errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-[10px] text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              <User className="inline w-3 h-3 mr-1" />
              Father Name <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("fatherName", { required: "Father name is required" })}
              placeholder="Muhammad Hassan"
              className={cn("h-9 text-sm", errors.fatherName && "border-destructive")}
            />
            {errors.fatherName && (
              <p className="text-[10px] text-destructive mt-1">{errors.fatherName.message}</p>
            )}
          </div>
        </div>

        {/* Gender & DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select value={gender} onValueChange={(v) => { if (v) setGender(v); }} required>
              <SelectTrigger className={cn("h-9 text-sm", !gender && "text-muted-foreground")}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              <Calendar className="inline w-3 h-3 mr-1" />
              Date of Birth <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              {...register("dob", { required: "DOB is required" })}
              className={cn("h-9 text-sm", errors.dob && "border-destructive")}
            />
            {errors.dob && (
              <p className="text-[10px] text-destructive mt-1">{errors.dob.message}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">
            <Phone className="inline w-3 h-3 mr-1" />
            Phone Number <span className="text-destructive">*</span>
          </Label>
          <Input
            type="tel"
            {...register("phone", {
              required: "Phone is required",
              pattern: { value: /^0[0-9]{3}-[0-9]{7}$/, message: "Format: 0300-1234567" },
            })}
            placeholder="0300-1234567"
            className={cn("h-9 text-sm font-mono", errors.phone && "border-destructive")}
          />
          {errors.phone && (
            <p className="text-[10px] text-destructive mt-1">{errors.phone.message}</p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">Format: 0300-1234567</p>
        </div>

        {/* Address */}
        <div>
          <Label className="text-xs font-semibold mb-1.5 block">
            <MapPin className="inline w-3 h-3 mr-1" />
            Full Address <span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("address", { required: "Address is required" })}
            placeholder="House #123, Street #5, Area Name, Sialkot"
            className={cn("h-9 text-sm", errors.address && "border-destructive")}
          />
          {errors.address && (
            <p className="text-[10px] text-destructive mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Area & Member Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              <MapPin className="inline w-3 h-3 mr-1" />
              Area <span className="text-destructive">*</span>
            </Label>
            <Select value={area} onValueChange={(v) => { if (v) setArea(v); }}>
              <SelectTrigger className={cn("h-9 text-sm", !area && "text-muted-foreground")}>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {ALL_AREAS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              <Flag className="inline w-3 h-3 mr-1" />
              Request Member Bar <span className="text-destructive">*</span>
            </Label>
            <Select value={memberBar} onValueChange={(v) => { if (v) setMemberBar(v); }}>
              <SelectTrigger className={cn("h-9 text-sm", !memberBar && "text-muted-foreground")}>
                <SelectValue placeholder="Select member bar" />
              </SelectTrigger>
              <SelectContent>
                {ALL_REQUEST_MEMBER_BARS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-muted/20">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Saving...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Register Member
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
          Clear Form
        </Button>
        <p className="ml-auto text-[10px] text-muted-foreground">
          {/* TODO: Backend Integration — MongoDB API Connection */}
          Frontend only · No data is saved
        </p>
      </div>
    </motion.form>
  );
}
