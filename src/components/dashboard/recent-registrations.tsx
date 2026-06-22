"use client";

import { motion } from "framer-motion";
import { MOCK_MEMBERS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const recent = MOCK_MEMBERS.slice(0, 8);

export function RecentRegistrations() {
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

      <div className="space-y-2">
        {recent.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
              member.gender === "Male"
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : "bg-gradient-to-br from-pink-500 to-pink-600"
            )}>
              {member.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {member.area} · {member.serialNumber}
              </p>
            </div>

            {/* Meta */}
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
    </motion.div>
  );
}
