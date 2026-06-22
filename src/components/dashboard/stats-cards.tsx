"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, UserX, CalendarDays, Calendar, MapPin, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { cn } from "@/lib/utils";

const CARD_CONFIG = [
  {
    key: "total" as const,
    title: "Total Members",
    getValue: (s: ReturnType<typeof useDashboardStats>["stats"]) => s?.total.toLocaleString() ?? "—",
    getChange: () => "All time",
    trend: "neutral" as const,
    icon: Users,
    gradient: "from-[#0F766E] to-[#0D9488]",
    bgGlow: "rgba(15, 118, 110, 0.15)",
    lightBg: "from-teal-50 to-teal-100/50",
    darkBg: "from-teal-950/40 to-teal-900/20",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-700 dark:text-teal-400",
    valueColor: "text-teal-800 dark:text-teal-300",
    changeColor: "text-teal-600 dark:text-teal-400",
  },
  {
    key: "male" as const,
    title: "Male Members",
    getValue: (s: ReturnType<typeof useDashboardStats>["stats"]) => s?.male.toLocaleString() ?? "—",
    getChange: (s: ReturnType<typeof useDashboardStats>["stats"]) =>
      s ? `${s.total > 0 ? Math.round((s.male / s.total) * 100) : 0}% of total` : "—",
    trend: "up" as const,
    icon: UserCheck,
    gradient: "from-[#1D4ED8] to-[#3B82F6]",
    bgGlow: "rgba(29, 78, 216, 0.12)",
    lightBg: "from-blue-50 to-blue-100/50",
    darkBg: "from-blue-950/40 to-blue-900/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-700 dark:text-blue-400",
    valueColor: "text-blue-800 dark:text-blue-300",
    changeColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "female" as const,
    title: "Female Members",
    getValue: (s: ReturnType<typeof useDashboardStats>["stats"]) => s?.female.toLocaleString() ?? "—",
    getChange: (s: ReturnType<typeof useDashboardStats>["stats"]) =>
      s ? `${s.total > 0 ? Math.round((s.female / s.total) * 100) : 0}% of total` : "—",
    trend: "up" as const,
    icon: UserX,
    gradient: "from-[#9D174D] to-[#EC4899]",
    bgGlow: "rgba(236, 72, 153, 0.12)",
    lightBg: "from-pink-50 to-pink-100/50",
    darkBg: "from-pink-950/40 to-pink-900/20",
    iconBg: "bg-pink-100 dark:bg-pink-900/40",
    iconColor: "text-pink-700 dark:text-pink-400",
    valueColor: "text-pink-800 dark:text-pink-300",
    changeColor: "text-pink-600 dark:text-pink-400",
  },
  {
    key: "today" as const,
    title: "Today's Registrations",
    getValue: (s: ReturnType<typeof useDashboardStats>["stats"]) => s?.todayCount.toString() ?? "—",
    getChange: () => new Date().toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" }),
    trend: "up" as const,
    icon: CalendarDays,
    gradient: "from-[#D97706] to-[#F59E0B]",
    bgGlow: "rgba(245, 158, 11, 0.12)",
    lightBg: "from-amber-50 to-amber-100/50",
    darkBg: "from-amber-950/40 to-amber-900/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-700 dark:text-amber-400",
    valueColor: "text-amber-800 dark:text-amber-300",
    changeColor: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "month" as const,
    title: "This Month",
    getValue: (s: ReturnType<typeof useDashboardStats>["stats"]) => s?.thisMonthCount.toString() ?? "—",
    getChange: () => new Date().toLocaleDateString("en-PK", { month: "long", year: "numeric" }),
    trend: "neutral" as const,
    icon: Calendar,
    gradient: "from-[#6D28D9] to-[#8B5CF6]",
    bgGlow: "rgba(139, 92, 246, 0.12)",
    lightBg: "from-violet-50 to-violet-100/50",
    darkBg: "from-violet-950/40 to-violet-900/20",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-700 dark:text-violet-400",
    valueColor: "text-violet-800 dark:text-violet-300",
    changeColor: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "topArea" as const,
    title: "Top Area",
    getValue: (s: ReturnType<typeof useDashboardStats>["stats"]) => s?.topArea ?? "—",
    getChange: (s: ReturnType<typeof useDashboardStats>["stats"]) =>
      s ? `${s.topAreaCount} members` : "—",
    trend: "neutral" as const,
    icon: MapPin,
    gradient: "from-[#065F46] to-[#10B981]",
    bgGlow: "rgba(16, 185, 129, 0.12)",
    lightBg: "from-emerald-50 to-emerald-100/50",
    darkBg: "from-emerald-950/40 to-emerald-900/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-700 dark:text-emerald-400",
    valueColor: "text-emerald-800 dark:text-emerald-300",
    changeColor: "text-emerald-600 dark:text-emerald-400",
  },
];

function StatCardSkeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-4"
    >
      <div className="w-9 h-9 rounded-xl bg-muted animate-pulse mb-3" />
      <div className="h-3 w-20 rounded bg-muted animate-pulse mb-2" />
      <div className="h-6 w-14 rounded bg-muted animate-pulse mb-3" />
      <div className="h-2.5 w-16 rounded bg-muted animate-pulse" />
    </motion.div>
  );
}

export function StatsCards() {
  const { stats, loading, error, refetch } = useDashboardStats();

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 flex items-center gap-4">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Failed to load statistics</p>
          <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {CARD_CONFIG.map((c, i) => <StatCardSkeleton key={c.key} delay={i * 0.05} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARD_CONFIG.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border",
            `bg-gradient-to-br ${card.lightBg} dark:${card.darkBg}`,
            "p-4 cursor-default group"
          )}
          style={{ boxShadow: `0 4px 24px ${card.bgGlow}` }}
        >
          <div
            className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-125"
            style={{ background: card.gradient.split(" ")[0].replace("from-[", "").replace("]", "") }}
          />

          <div className="relative">
            <div className={cn("inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3", card.iconBg)}>
              <card.icon className={cn("w-4 h-4", card.iconColor)} />
            </div>

            <p className="text-xs font-medium text-muted-foreground mb-1 leading-none">{card.title}</p>
            <p className={cn("text-xl font-bold leading-none mb-2 tracking-tight", card.valueColor)}>
              {card.getValue(stats)}
            </p>

            <div className="flex items-center gap-1">
              {card.trend === "up" && <TrendingUp className={cn("w-3 h-3", card.changeColor)} />}
              <span className={cn("text-[10px] font-semibold", card.changeColor)}>
                {card.getChange(stats)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
