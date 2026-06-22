"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  MOCK_MONTHLY_REGISTRATIONS, MOCK_AREA_STATS, MOCK_GENDER_DATA, DASHBOARD_STATS,
} from "@/lib/mock-data";
import { TrendingUp, Users, MapPin, Activity, BarChart3, PieChart as PieIcon } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const WEEKDAY_DATA = [
  { day: "Mon", registrations: 28, male: 17, female: 11 },
  { day: "Tue", registrations: 35, male: 21, female: 14 },
  { day: "Wed", registrations: 42, male: 25, female: 17 },
  { day: "Thu", registrations: 31, male: 19, female: 12 },
  { day: "Fri", registrations: 18, male: 11, female: 7 },
  { day: "Sat", registrations: 52, male: 31, female: 21 },
  { day: "Sun", registrations: 24, male: 14, female: 10 },
];

const HOURLY_DATA = [
  { hour: "8am", count: 4 }, { hour: "9am", count: 12 }, { hour: "10am", count: 18 },
  { hour: "11am", count: 22 }, { hour: "12pm", count: 14 }, { hour: "1pm", count: 8 },
  { hour: "2pm", count: 16 }, { hour: "3pm", count: 20 }, { hour: "4pm", count: 25 },
  { hour: "5pm", count: 19 }, { hour: "6pm", count: 11 }, { hour: "7pm", count: 6 },
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: DASHBOARD_STATS.totalMembers.toLocaleString(), icon: Users, color: "teal", trend: "+12.5% this month" },
          { label: "Active Areas", value: "15", icon: MapPin, color: "violet", trend: "3 new areas" },
          { label: "Avg Daily Reg.", value: "34", icon: Activity, color: "amber", trend: "+8% vs last month" },
          { label: "Completion Rate", value: "78%", icon: TrendingUp, color: "emerald", trend: "Target: 85%" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
              <stat.icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-primary font-medium mt-1">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Monthly Trend (2024)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_MONTHLY_REGISTRATIONS} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="registrations" name="Total" stroke="#0F766E" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="male" name="Male" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="female" name="Female" stroke="#EC4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-sm">Daily Registration Pattern</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={HOURLY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Registrations" stroke="#F59E0B" strokeWidth={2.5} fill="url(#analyticsGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gender */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <PieIcon className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Gender Split</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={MOCK_GENDER_DATA} cx="50%" cy="50%" outerRadius={70} paddingAngle={4} dataKey="value">
                {MOCK_GENDER_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Area bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Area Performance</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_AREA_STATS.slice(0, 7)} margin={{ top: 5, right: 5, left: -20, bottom: 40 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="area" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
              <Bar dataKey="count" name="Members" fill="#0F766E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weekday pattern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <h3 className="font-semibold text-sm">Weekly Registration Pattern</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={WEEKDAY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="male" name="Male" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="female" name="Female" fill="#EC4899" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
