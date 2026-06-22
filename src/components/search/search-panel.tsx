"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RotateCcw, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MOCK_MEMBERS, ALL_AREAS, ALL_REQUEST_MEMBER_BARS } from "@/lib/mock-data";
import { Member } from "@/types";
import { cn } from "@/lib/utils";

const BIRTH_YEARS = Array.from({ length: 60 }, (_, i) => String(2005 - i));

interface Filters {
  serialExact: string;
  serialFrom: string;
  serialTo: string;
  name: string;
  fatherName: string;
  gender: string;
  birthYear: string;
  area: string;
  regFrom: string;
  regTo: string;
  requestMemberBar: string;
}

const EMPTY_FILTERS: Filters = {
  serialExact: "", serialFrom: "", serialTo: "",
  name: "", fatherName: "",
  gender: "all", birthYear: "all", area: "all",
  regFrom: "", regTo: "", requestMemberBar: "all",
};

export function SearchPanel() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const setField = (key: keyof Filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setApplied({ ...filters });
    setHasSearched(true);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(null);
    setHasSearched(false);
  };

  const results = useMemo(() => {
    if (!applied) return [];
    let data = [...MOCK_MEMBERS];

    if (applied.serialExact) {
      data = data.filter((m) => m.serialNumber.toLowerCase().includes(applied.serialExact.toLowerCase()));
    }
    if (applied.serialFrom || applied.serialTo) {
      data = data.filter((m) => {
        const num = parseInt(m.serialNumber.replace("SLK-", ""));
        const from = applied.serialFrom ? parseInt(applied.serialFrom) : 0;
        const to = applied.serialTo ? parseInt(applied.serialTo) : Infinity;
        return num >= from && num <= to;
      });
    }
    if (applied.name.trim()) {
      data = data.filter((m) => m.name.toLowerCase().includes(applied.name.toLowerCase()));
    }
    if (applied.fatherName.trim()) {
      data = data.filter((m) => m.fatherName.toLowerCase().includes(applied.fatherName.toLowerCase()));
    }
    if (applied.gender !== "all") {
      data = data.filter((m) => m.gender === applied.gender);
    }
    if (applied.birthYear !== "all") {
      data = data.filter((m) => m.dob.startsWith(applied.birthYear));
    }
    if (applied.area !== "all") {
      data = data.filter((m) => m.area === applied.area);
    }
    if (applied.regFrom) {
      data = data.filter((m) => m.registrationDate >= applied.regFrom);
    }
    if (applied.regTo) {
      data = data.filter((m) => m.registrationDate <= applied.regTo);
    }
    if (applied.requestMemberBar !== "all") {
      data = data.filter((m) => m.requestMemberBar === applied.requestMemberBar);
    }

    return data;
  }, [applied]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    v && v !== "all" && v !== ""
  ).length;

  return (
    <div className="space-y-5">
      {/* Filter Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Advanced Filters</h3>
              <p className="text-[10px] text-muted-foreground">Filter member records with precision</p>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Serial Number */}
          <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary" /> Serial Number
            </p>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Exact match</Label>
              <Input
                placeholder="SLK-0001"
                value={filters.serialExact}
                onChange={(e) => setField("serialExact")(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">From</Label>
                <Input placeholder="1" value={filters.serialFrom}
                  onChange={(e) => setField("serialFrom")(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">To</Label>
                <Input placeholder="100" value={filters.serialTo}
                  onChange={(e) => setField("serialTo")(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
          </div>

          {/* Name & Father Name */}
          <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary" /> Name Search
            </p>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Member Name</Label>
              <Input placeholder="Enter name..." value={filters.name}
                onChange={(e) => setField("name")(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Father Name</Label>
              <Input placeholder="Enter father name..." value={filters.fatherName}
                onChange={(e) => setField("fatherName")(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          {/* Gender & Birth Year */}
          <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary" /> Demographics
            </p>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Gender</Label>
              <Select value={filters.gender} onValueChange={(v) => { if (v) setField("gender")(v); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Birth Year</Label>
              <Select value={filters.birthYear} onValueChange={(v) => { if (v) setField("birthYear")(v); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {BIRTH_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Area */}
          <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary" /> Location
            </p>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Area</Label>
              <Select value={filters.area} onValueChange={(v) => { if (v) setField("area")(v); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {ALL_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Registration Date */}
          <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary" /> Registration Date
            </p>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">From</Label>
              <Input type="date" value={filters.regFrom}
                onChange={(e) => setField("regFrom")(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">To</Label>
              <Input type="date" value={filters.regTo}
                onChange={(e) => setField("regTo")(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          {/* Member Bar */}
          <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary" /> Political Affiliation
            </p>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Request Member Bar</Label>
              <Select value={filters.requestMemberBar} onValueChange={(v) => { if (v) setField("requestMemberBar")(v); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select bar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bars</SelectItem>
                  {ALL_REQUEST_MEMBER_BARS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-muted/20">
          <Button
            onClick={applyFilters}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25"
            size="sm"
          >
            <Search className="w-3.5 h-3.5" />
            Apply Filters
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">
                  Search Results
                </h3>
                <Badge variant="secondary" className="text-xs ml-1">
                  {results.length} found
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {["Serial #", "Name", "Father Name", "Gender", "DOB", "Area", "Phone", "Member Bar", "Reg. Date"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 50).map((member, idx) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.015 }}
                      className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2.5 font-mono font-medium text-primary">{member.serialNumber}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{member.name}</td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{member.fatherName}</td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-4 border-0",
                            member.gender === "Male"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
                          )}
                        >
                          {member.gender}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{member.dob}</td>
                      <td className="px-3 py-2.5">
                        <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded font-medium">
                          {member.area}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{member.phone}</td>
                      <td className="px-3 py-2.5 text-muted-foreground max-w-[120px] truncate">{member.requestMemberBar}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{member.registrationDate}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {results.length === 0 && (
                <div className="py-16 text-center">
                  <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">No records found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search filters</p>
                </div>
              )}

              {results.length > 50 && (
                <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                  Showing 50 of {results.length} results.
                  {/* FUTURE BACKEND INTEGRATION — Server-side Filtering & Pagination */}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
