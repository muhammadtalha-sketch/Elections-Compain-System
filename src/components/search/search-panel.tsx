"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RotateCcw, ChevronRight, Users, Loader2, AlertCircle, ChevronsUpDown, Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { searchMembers, getDistinctAreas, getDistinctBars, FirestoreMember } from "@/services/memberService";
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
  const [results, setResults] = useState<FirestoreMember[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [bars, setBars] = useState<string[]>([]);
  const [areaOpen, setAreaOpen] = useState(false);

  useEffect(() => {
    getDistinctAreas().then(setAreas).catch(() => {});
    getDistinctBars().then(setBars).catch(() => {});
  }, []);

  const setField = (key: keyof Filters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const applyFilters = async () => {
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const data = await searchMembers({
        serialExact: filters.serialExact || undefined,
        serialFrom: filters.serialFrom ? parseInt(filters.serialFrom) : undefined,
        serialTo: filters.serialTo ? parseInt(filters.serialTo) : undefined,
        name: filters.name || undefined,
        fatherName: filters.fatherName || undefined,
        gender: filters.gender !== "all" ? filters.gender : undefined,
        birthYear: filters.birthYear !== "all" ? parseInt(filters.birthYear) : undefined,
        area: filters.area !== "all" ? filters.area : undefined,
        regFrom: filters.regFrom || undefined,
        regTo: filters.regTo || undefined,
        requestMemberBar: filters.requestMemberBar !== "all" ? filters.requestMemberBar : undefined,
      });
      setResults(data);
      if (data.length === 0) {
        toast.info("No records matched your filters.");
      } else {
        toast.success(`Found ${data.length} member${data.length !== 1 ? "s" : ""}`);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Search failed";
      setSearchError(msg);
      toast.error("Search failed", { description: msg });
    } finally {
      setIsSearching(false);
    }
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setResults([]);
    setHasSearched(false);
    setSearchError(null);
  };

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v && v !== "all" && v !== "").length;

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
              <p className="text-[10px] text-muted-foreground">Search Supabase in real time</p>
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
              <Input placeholder="SLK-0001" value={filters.serialExact}
                onChange={(e) => setField("serialExact")(e.target.value)} className="h-8 text-xs" />
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
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select gender" /></SelectTrigger>
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
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {BIRTH_YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Area — searchable combobox */}
          <div className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary" /> Location
            </p>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Area</Label>
              <Popover open={areaOpen} onOpenChange={setAreaOpen}>
                <PopoverTrigger
                  className={cn(
                    "w-full flex items-center justify-between h-8 px-3 rounded-md border border-input bg-background text-xs transition-colors",
                    "hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    filters.area === "all" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {filters.area === "all" ? "All Areas" : filters.area}
                  </span>
                  <ChevronsUpDown className="w-3 h-3 opacity-50 flex-shrink-0 ml-1" />
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search area…" className="h-8 text-xs" />
                    <CommandList>
                      <CommandEmpty className="text-xs py-4 text-center text-muted-foreground">
                        {areas.length === 0 ? "Loading areas…" : "No area found"}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => { setField("area")("all"); setAreaOpen(false); }}
                          className="text-xs gap-2"
                        >
                          <Check className={cn("w-3 h-3", filters.area === "all" ? "opacity-100" : "opacity-0")} />
                          All Areas
                        </CommandItem>
                        {areas.map((a) => (
                          <CommandItem
                            key={a}
                            value={a}
                            onSelect={(val) => { setField("area")(val); setAreaOpen(false); }}
                            className="text-xs gap-2"
                          >
                            <Check className={cn("w-3 h-3", filters.area === a ? "opacity-100" : "opacity-0")} />
                            {a}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select bar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {bars.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-muted/20">
          <Button
            onClick={applyFilters}
            disabled={isSearching}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25"
            size="sm"
          >
            {isSearching ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…</>
            ) : (
              <><Search className="w-3.5 h-3.5" /> Search</>
            )}
          </Button>
          <Button onClick={resetFilters} variant="outline" size="sm" className="gap-2" disabled={isSearching}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          <p className="ml-auto text-[10px] text-muted-foreground">Live Supabase queries</p>
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
                <h3 className="font-semibold text-sm text-foreground">Search Results</h3>
                {!isSearching && (
                  <Badge variant="secondary" className="text-xs ml-1">{results.length} found</Badge>
                )}
              </div>
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-16 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching Supabase…</p>
              </div>
            )}

            {!isSearching && searchError && (
              <div className="flex items-center gap-3 p-5">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-foreground">{searchError}</p>
              </div>
            )}

            {!isSearching && !searchError && (
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
                    {results.slice(0, 100).map((member, idx) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.012 }}
                        className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2.5 font-mono font-medium text-primary">{member.serialNumber}</td>
                        <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{member.name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{member.fatherName}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className={cn(
                            "text-[10px] px-1.5 py-0 h-4 border-0",
                            member.gender === "Male"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
                          )}>
                            {member.gender}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-muted-foreground">{member.dob}</td>
                        <td className="px-3 py-2.5">
                          <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {member.area}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-muted-foreground">{member.phoneNumber}</td>
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

                {results.length > 100 && (
                  <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                    Showing first 100 of {results.length} results. Narrow filters for more precise results.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
