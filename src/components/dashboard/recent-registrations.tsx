"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllMembers, FirestoreMember } from "@/services/memberService";

export function RecentRegistrations() {
  const [members, setMembers] = useState<FirestoreMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await getAllMembers();
      setMembers(all.slice(0, 8));
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground leading-none">Recent Registrations</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Latest member records</p>
          </div>
        </div>
        <a href="/dashboard/members" className="text-[11px] text-primary font-semibold hover:underline">
          View all →
        </a>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl">
              <div className="w-8 h-8 rounded-xl bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">Failed to load</p>
          <button onClick={load} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xs font-semibold text-foreground">No members yet</p>
          <p className="text-[10px] text-muted-foreground text-center">
            Add your first member to see recent registrations here.
          </p>
          <a href="/dashboard/add-member" className="text-[11px] text-primary font-semibold hover:underline mt-1">
            Add Member →
          </a>
        </div>
      )}

      {!loading && !error && members.length > 0 && (
        <div className="space-y-2">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                member.gender === "Male"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-pink-500 to-pink-600"
              )}>
                {member.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {member.area} · {member.serialNumber}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 py-0 h-4 font-semibold border-0",
                    member.gender === "Male"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                      : "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400"
                  )}
                >
                  {member.gender}
                </Badge>
                <span className="text-[9px] text-muted-foreground">{member.registrationDate}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
