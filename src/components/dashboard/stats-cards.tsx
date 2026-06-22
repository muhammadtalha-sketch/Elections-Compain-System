"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, UserX, CalendarDays, Calendar, MapPin, TrendingUp } from "lucide-react";
import { DASHBOARD_STATS } from "@/lib/mock-data";

const cards = [
  {
    title: "Total Members",
    value: DASHBOARD_STATS.totalMembers.toLocaleString(),
    change: "+12.5%",
    trend: "up",
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
    title: "Male Members",
    value: DASHBOARD_STATS.maleMembers.toLocaleString(),
    change: "+8.3%",
    trend: "up",
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
    title: "Female Members",
    value: DASHBOARD_STATS.femaleMembers.toLocaleString(),
    change: "+18.7%",
    trend: "up",
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
    title: "Today's Registrations",
    value: DASHBOARD_STATS.todayRegistrations.toString(),
    change: "+4 since 9am",
    trend: "up",
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
    title: "This Month",
    value: DASHBOARD_STATS.monthRegistrations.toString(),
    change: "Dec 2024",
    trend: "neutral",
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
    title: "Top Area",
    value: DASHBOARD_STATS.topArea,
    change: "156 members",
    trend: "neutral",
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

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={`
            relative overflow-hidden rounded-2xl border border-border
            bg-gradient-to-br ${card.lightBg} dark:${card.darkBg}
            p-4 cursor-default group
          `}
          style={{ boxShadow: `0 4px 24px ${card.bgGlow}` }}
        >
          {/* Background decorative circle */}
          <div
            className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-125"
            style={{ background: card.gradient.replace("from-", "").split(" ")[0] }}
          />

          <div className="relative">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${card.iconBg} mb-3`}>
              <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
            </div>

            <p className="text-xs font-medium text-muted-foreground mb-1 leading-none">{card.title}</p>
            <p className={`text-xl font-bold ${card.valueColor} leading-none mb-2 tracking-tight`}>
              {card.value}
            </p>

            <div className="flex items-center gap-1">
              {card.trend === "up" && <TrendingUp className={`w-3 h-3 ${card.changeColor}`} />}
              <span className={`text-[10px] font-semibold ${card.changeColor}`}>{card.change}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
