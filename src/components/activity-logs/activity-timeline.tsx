"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LogIn, UserPlus, UserCog, Upload, Download, Settings, Shield, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getActivityLogs, ActivityLogEntry } from "@/services/activityLogService";
import { cn } from "@/lib/utils";

const ACTION_TYPE_MAP: Record<string, keyof typeof TYPE_CONFIG> = {
  "User Login":       "login",
  "User Logout":      "login",
  "Member Added":     "member_added",
  "Member Updated":   "member_updated",
  "Member Deleted":   "member_updated",
  "Import Completed": "import",
  "Export Generated": "export",
  "User Created":     "user_created",
  "Settings Updated": "settings",
};

const TYPE_CONFIG = {
  login:          { icon: LogIn,    color: "text-teal-600 dark:text-teal-400",   bg: "bg-teal-100 dark:bg-teal-900/40" },
  member_added:   { icon: UserPlus, color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/40" },
  member_updated: { icon: UserCog,  color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/40" },
  import:         { icon: Upload,   color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
  export:         { icon: Download, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  user_created:   { icon: UserPlus, color: "text-pink-600 dark:text-pink-400",   bg: "bg-pink-100 dark:bg-pink-900/40" },
  settings:       { icon: Settings, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/60" },
  default:        { icon: Shield,   color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/60" },
};

const ROLE_CONFIG: Record<string, { color: string; bg: string }> = {
  Admin:                { color: "text-red-700 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-950/40" },
  Manager:              { color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
  "Data Entry Operator":{ color: "text-blue-700 dark:text-blue-400",  bg: "bg-blue-50 dark:bg-blue-950/40" },
  Viewer:               { color: "text-slate-700 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/60" },
  System:               { color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/60" },
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("en-PK", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function groupByDate(logs: ActivityLogEntry[]) {
  const groups: Record<string, ActivityLogEntry[]> = {};
  logs.forEach((log) => {
    if (!log.timestamp) return;
    const date = log.timestamp.split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });
  return groups;
}

export function ActivityTimeline() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivityLogs(100);
      setLogs(data);
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading activity logs…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm p-8 flex items-center gap-4">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Failed to load activity logs</p>
          <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
        </div>
        <button onClick={load} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-sm p-12 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Shield className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          System events will appear here once members are added, updated, or imported.
        </p>
      </div>
    );
  }

  const grouped = groupByDate(logs);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border bg-muted/20">
        <h3 className="font-semibold text-sm text-foreground">Activity Timeline</h3>
        <p className="text-xs text-muted-foreground mt-0.5">All system events and user actions</p>
      </div>

      <div className="p-5 space-y-8">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 bg-muted rounded-full whitespace-nowrap">
                {new Date(date).toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="relative space-y-4">
              <div className="absolute left-4 top-5 bottom-0 w-px bg-border" />

              {grouped[date].map((log, idx) => {
                const typeKey = ACTION_TYPE_MAP[log.action] ?? "default";
                const typeConf = TYPE_CONFIG[typeKey] ?? TYPE_CONFIG.default;
                const roleConf = ROLE_CONFIG[log.userRole] ?? ROLE_CONFIG.System;
                const IconComponent = typeConf.icon;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="relative flex items-start gap-3 pl-12"
                  >
                    <div className={cn(
                      "absolute left-0 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-background shadow-sm",
                      typeConf.bg
                    )}>
                      <IconComponent className={cn("w-4 h-4", typeConf.color)} />
                    </div>

                    <div className="flex-1 min-w-0 bg-muted/30 rounded-xl p-3 border border-border/60 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-foreground">{log.action}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {log.timestamp ? formatTime(log.timestamp) : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{log.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="text-[10px] font-medium text-foreground">{log.userName}</span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-semibold", roleConf.bg, roleConf.color)}>
                          {log.userRole}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground">{logs.length} events shown</p>
      </div>
    </motion.div>
  );
}
