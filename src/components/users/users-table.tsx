"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, MoreHorizontal, Edit, Trash2, Shield, Eye,
  Search, CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUsers, FirestoreUser } from "@/services/userService";
import { cn } from "@/lib/utils";

type Role = "Admin" | "Manager" | "Data Entry Operator" | "Viewer";

const ROLE_CONFIG: Record<Role, { color: string; bg: string }> = {
  Admin:                  { color: "text-red-700 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-950/40" },
  Manager:                { color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
  "Data Entry Operator":  { color: "text-blue-700 dark:text-blue-400",  bg: "bg-blue-50 dark:bg-blue-950/40" },
  Viewer:                 { color: "text-slate-700 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/60" },
};

const AVATAR_COLORS = [
  "from-teal-500 to-teal-600",
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-amber-500 to-amber-600",
  "from-pink-500 to-pink-600",
  "from-emerald-500 to-emerald-600",
  "from-indigo-500 to-indigo-600",
];

export function UsersTable() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dt: unknown) => {
    if (!dt || typeof dt !== "string") return "—";
    return new Date(dt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center gap-4">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Failed to load users</p>
          <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
        </div>
        <button onClick={load} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground text-sm">System Users</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{users.length} users registered</p>
        </div>
        <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 h-8">
          <UserPlus className="w-3.5 h-3.5" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-border">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Shield className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No users yet</p>
          <p className="text-xs text-muted-foreground">Sign up to create the first admin account.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["User", "Email", "Phone", "Role", "Status", "Created", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => {
                const roleConfig = ROLE_CONFIG[user.role as Role] ?? ROLE_CONFIG.Viewer;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={cn("text-white text-[11px] font-bold bg-gradient-to-br", AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground whitespace-nowrap">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{user.id?.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{user.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", roleConfig.bg, roleConfig.color)}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn("flex items-center gap-1 text-[10px] font-semibold",
                        user.status === "Active" ? "text-green-600 dark:text-green-400" : "text-slate-500")}>
                        {user.status === "Active"
                          ? <CheckCircle2 className="w-3 h-3" />
                          : <XCircle className="w-3 h-3" />}
                        {user.status}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer outline-none">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                            <Eye className="w-3 h-3" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                            <Edit className="w-3 h-3" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer">
                            <Shield className="w-3 h-3" /> Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs gap-2 text-destructive cursor-pointer focus:text-destructive">
                            <Trash2 className="w-3 h-3" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 py-3 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">{filtered.length} users shown</p>
      </div>
    </motion.div>
  );
}
