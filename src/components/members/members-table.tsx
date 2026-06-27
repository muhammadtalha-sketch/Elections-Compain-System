"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Download, FileText, Search, Filter,
  Eye, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, RefreshCw, Users, ThumbsUp, ThumbsDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useMembers } from "@/hooks/useMembers";
import { FirestoreMember, updateInterestStatus } from "@/services/memberService";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import type { InterestStatus } from "@/types/database.types";

const INTEREST_BADGE: Record<InterestStatus, string> = {
  "Interested":     "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  "Not Interested": "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  "Pending":        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

type SortKey = keyof FirestoreMember;
type SortDir = "asc" | "desc" | null;

const ALL_COLUMNS = [
  { key: "serialNumber",    label: "Serial #",       visible: true  },
  { key: "name",            label: "Name",           visible: true  },
  { key: "fatherName",      label: "Father Name",    visible: true  },
  { key: "gender",          label: "Gender",         visible: true  },
  { key: "dob",             label: "DOB",            visible: true  },
  { key: "birthYear",       label: "Birth Year",     visible: false },
  { key: "address",         label: "Address",        visible: false },
  { key: "area",            label: "Area",           visible: true  },
  { key: "phoneNumber",     label: "Phone",          visible: true  },
  { key: "requestMemberBar",label: "Member Bar",     visible: true  },
  { key: "registrationDate",label: "Reg. Date",      visible: true  },
  { key: "interestStatus",  label: "Interest",       visible: true  },
  { key: "status",          label: "Status",         visible: false },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function MembersTable() {
  const { members, loading, error, refetch, remove } = useMembers();
  const { user } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("registrationDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [interestFilter, setInterestFilter] = useState<string>("all");
  const [localInterest, setLocalInterest] = useState<Record<string, InterestStatus>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_COLUMNS.map((c) => [c.key, c.visible]))
  );

  const handleInterestClick = async (memberId: string, status: InterestStatus) => {
    if (!user) return;
    const prev = localInterest[memberId];
    setLocalInterest((p) => ({ ...p, [memberId]: status }));
    try {
      await updateInterestStatus(memberId, status, user.id);
      toast.success(`Marked as ${status}`);
    } catch {
      setLocalInterest((p) => ({ ...p, [memberId]: prev }));
      toast.error("Failed to update interest status");
    }
  };

  const filtered = useMemo(() => {
    let data = [...members];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.fatherName.toLowerCase().includes(q) ||
          m.serialNumber.toLowerCase().includes(q) ||
          m.area.toLowerCase().includes(q) ||
          (m.phoneNumber ?? "").includes(q)
      );
    }

    if (genderFilter !== "all")   data = data.filter((m) => m.gender === genderFilter);
    if (statusFilter !== "all")   data = data.filter((m) => m.status === statusFilter);
    if (interestFilter !== "all") data = data.filter((m) => {
      const effective = localInterest[m.id ?? ""] ?? m.interestStatus;
      return effective === interestFilter;
    });

    if (sortKey && sortDir) {
      data.sort((a, b) => {
        const aVal = a[sortKey] ?? "";
        const bVal = b[sortKey] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return data;
  }, [members, search, genderFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === null) setSortKey(key);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((m) => m.id ?? "")));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await remove(id);
      toast.success(`${name} deleted successfully`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: unknown) {
      toast.error("Delete failed", { description: (err as Error).message });
    }
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    if (sortDir === "asc") return <ChevronUp className="w-3 h-3 text-primary" />;
    if (sortDir === "desc") return <ChevronDown className="w-3 h-3 text-primary" />;
    return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center justify-center gap-3"
      >
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading members from Supabase…</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center gap-4"
      >
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Failed to load members</p>
          <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
        </div>
        <button onClick={refetch} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search members…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-8 text-sm"
          />
        </div>

        <Select value={genderFilter} onValueChange={(v) => { if (v) { setGenderFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gender</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={interestFilter} onValueChange={(v) => { if (v) { setInterestFilter(v); setPage(1); } }}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Interest" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interest</SelectItem>
            <SelectItem value="Interested">Interested</SelectItem>
            <SelectItem value="Not Interested">Not Interested</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {selectedIds.size > 0 && (
          <Badge variant="secondary" className="text-xs">{selectedIds.size} selected</Badge>
        )}

        <button
          onClick={refetch}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer outline-none"
          title="Refresh from Supabase"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer outline-none">
            <Filter className="w-3 h-3" />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs">Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_COLUMNS.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                checked={visibleColumns[col.key]}
                onCheckedChange={(v) => setVisibleColumns((p) => ({ ...p, [col.key]: v }))}
                className="text-xs"
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer outline-none">
            <Download className="w-3 h-3" />
            Export
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
              <FileText className="w-3 h-3" /> Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
              <FileText className="w-3 h-3" /> Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
              <FileText className="w-3 h-3" /> Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No members yet</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            No members found in the database. Add members manually or run the SQL migration.
          </p>
          <div className="flex gap-2 mt-1">
            <a href="/dashboard/add-member">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">Add Member</Button>
            </a>
            <a href="/dashboard/import">
              <Button size="sm" variant="outline" className="text-xs">Import Excel</Button>
            </a>
          </div>
        </div>
      )}

      {/* Table */}
      {members.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="w-10 px-3 py-3 text-left">
                  <Checkbox
                    checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                {ALL_COLUMNS.filter((c) => visibleColumns[c.key]).map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort(col.key as SortKey)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon colKey={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((member, idx) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className={cn(
                    "border-b border-border/60 hover:bg-muted/30 transition-colors",
                    selectedIds.has(member.id ?? "") && "bg-primary/5"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <Checkbox
                      checked={selectedIds.has(member.id ?? "")}
                      onCheckedChange={() => toggleRow(member.id ?? "")}
                    />
                  </td>

                  {visibleColumns.serialNumber && (
                    <td className="px-3 py-2.5 font-mono font-medium text-primary">{member.serialNumber}</td>
                  )}
                  {visibleColumns.name && (
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0",
                          member.gender === "Male" ? "bg-blue-500" : "bg-pink-500"
                        )}>
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground whitespace-nowrap">{member.name}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.fatherName && (
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{member.fatherName}</td>
                  )}
                  {visibleColumns.gender && (
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 h-4 border-0 font-semibold",
                        member.gender === "Male"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          : "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
                      )}>
                        {member.gender}
                      </Badge>
                    </td>
                  )}
                  {visibleColumns.dob && (
                    <td className="px-3 py-2.5 text-muted-foreground font-mono">{member.dob}</td>
                  )}
                  {visibleColumns.birthYear && (
                    <td className="px-3 py-2.5 text-center font-semibold text-foreground">{member.birthYear}</td>
                  )}
                  {visibleColumns.address && (
                    <td className="px-3 py-2.5 text-muted-foreground max-w-[180px] truncate" title={member.address}>
                      {member.address}
                    </td>
                  )}
                  {visibleColumns.area && (
                    <td className="px-3 py-2.5">
                      <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap">
                        {member.area}
                      </span>
                    </td>
                  )}
                  {visibleColumns.phoneNumber && (
                    <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap">{member.phoneNumber}</td>
                  )}
                  {visibleColumns.requestMemberBar && (
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap max-w-[140px] truncate" title={member.requestMemberBar}>
                      {member.requestMemberBar}
                    </td>
                  )}
                  {visibleColumns.registrationDate && (
                    <td className="px-3 py-2.5 font-mono text-muted-foreground whitespace-nowrap">{member.registrationDate}</td>
                  )}
                  {visibleColumns.interestStatus && (
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap",
                          INTEREST_BADGE[localInterest[member.id ?? ""] ?? member.interestStatus ?? "Pending"]
                        )}>
                          {localInterest[member.id ?? ""] ?? member.interestStatus ?? "Pending"}
                        </span>
                        <button
                          title="Mark Interested"
                          onClick={() => handleInterestClick(member.id ?? "", "Interested")}
                          className="w-5 h-5 rounded flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          title="Mark Not Interested"
                          onClick={() => handleInterestClick(member.id ?? "", "Not Interested")}
                          className="w-5 h-5 rounded flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 h-4 border-0 font-semibold",
                        member.status === "Active" && "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
                        member.status === "Pending" && "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
                        member.status === "Inactive" && "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                      )}>
                        {member.status}
                      </Badge>
                    </td>
                  )}

                  <td className="px-3 py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer outline-none">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => router.push(`/dashboard/members/${member.id}`)}>
                            <Eye className="w-3 h-3" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                          <Edit className="w-3 h-3" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-xs gap-2 text-destructive cursor-pointer focus:text-destructive"
                          onClick={() => handleDelete(member.id ?? "", member.name)}
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {paginated.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-sm">No members match your filters</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {members.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { if (v) { setPageSize(Number(v)); setPage(1); } }}>
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            {filtered.length === 0
              ? "0 results"
              : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}
          </p>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5 && page > 3) p = page - 2 + i;
              if (p > totalPages) return null;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
