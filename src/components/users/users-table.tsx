"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, MoreHorizontal, Shield, Eye,
  Search, CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw,
  Ban, KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { can, initials, ROLE_BADGE } from "@/lib/rbac";
import type { Profile, UserRole } from "@/types/database.types";

const ROLES: UserRole[] = ["Admin", "Manager", "Data Entry Operator", "Viewer"];

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
  const { user: currentUser, role: currentRole } = useAuth();
  const [users,   setUsers]   = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [search,  setSearch]  = useState("");

  const isAdmin   = can(currentRole, "manageUsers");
  const canView   = can(currentRole, "viewUsers");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) { setError(err.message); }
    else      { setUsers(data ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const { error: err } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (err) { toast.error(err.message); return; }
    toast.success("Role updated");
    setUsers(p => p.map(u => u.id === userId ? { ...u, role } : u));
  };

  const handleToggleActive = async (user: Profile) => {
    const newState = !user.is_active;
    const { error: err } = await supabase.from("profiles").update({ is_active: newState }).eq("id", user.id);
    if (err) { toast.error(err.message); return; }
    toast.success(newState ? "User activated" : "User deactivated");
    setUsers(p => p.map(u => u.id === user.id ? { ...u, is_active: newState } : u));
  };

  const handleResetPassword = async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (err) { toast.error(err.message); return; }
    toast.success(`Password reset email sent to ${email}`);
  };

  const filtered = users.filter(u =>
    (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (!canView) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center gap-4">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">You don&apos;t have permission to view users.</p>
      </div>
    );
  }

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
          <p className="text-xs text-muted-foreground mt-0.5">{users.length} registered users</p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            className="gap-1.5 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 h-8"
            onClick={() => toast.info("Invite via signup link: share /signup with the new user.")}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite User
          </Button>
        )}
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
          <p className="text-xs text-muted-foreground">Sign up to create the first account.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {["User", "Email", "Phone", "Role", "Status", "Joined", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={cn(
                      "border-b border-border/60 hover:bg-muted/30 transition-colors",
                      !u.is_active && "opacity-60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.full_name ?? ""} />}
                          <AvatarFallback className={cn("text-white text-[11px] font-bold bg-gradient-to-br", AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
                            {initials(u.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground whitespace-nowrap">
                            {u.full_name ?? "—"}
                            {isSelf && <span className="ml-1.5 text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-semibold">You</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{u.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      {isAdmin && !isSelf ? (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary",
                            ROLE_BADGE[u.role]
                          )}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", ROLE_BADGE[u.role])}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn("flex items-center gap-1 text-[10px] font-semibold",
                        u.is_active ? "text-green-600 dark:text-green-400" : "text-slate-400")}>
                        {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? "Active" : "Inactive"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer outline-none">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => toast.info(`Viewing ${u.full_name}`)}>
                            <Eye className="w-3 h-3" /> View Profile
                          </DropdownMenuItem>
                          {isAdmin && u.email && (
                            <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => handleResetPassword(u.email!)}>
                              <KeyRound className="w-3 h-3" /> Reset Password
                            </DropdownMenuItem>
                          )}
                          {isAdmin && !isSelf && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={cn("text-xs gap-2 cursor-pointer", u.is_active ? "text-amber-600" : "text-green-600")}
                                onClick={() => handleToggleActive(u)}
                              >
                                <Ban className="w-3 h-3" />
                                {u.is_active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </>
                          )}
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
        <p className="text-xs text-muted-foreground">{filtered.length} of {users.length} users shown</p>
      </div>
    </motion.div>
  );
}
