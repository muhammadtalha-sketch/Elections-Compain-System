"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";
import { TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function ChartSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-36 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-7 w-16 rounded bg-muted animate-pulse" />
      </div>
      <div className="h-[220px] rounded-xl bg-muted/40 animate-pulse" />
    </motion.div>
  );
}

export function RegistrationTrendChart() {
  const { data, loading, error, refetch } = useAnalytics();

  if (loading) return <ChartSkeleton />;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4"
      >
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Chart unavailable</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <button onClick={refetch} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </motion.div>
    );
  }

  const chartData = data?.monthly ?? [];
  const total = chartData.reduce((a, b) => a + b.total, 0);

  if (chartData.length === 0 || total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center h-[300px] gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">No registration data yet</p>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Add members to see the registration trend chart populate with live data.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Registration Trend</h3>
          </div>
          <p className="text-xs text-muted-foreground ml-9">Last 12 months overview</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-foreground">{total.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total registrations</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EC4899" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.6} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
            formatter={(value) => (
              <span style={{ color: "var(--muted-foreground)", textTransform: "capitalize" }}>{value}</span>
            )}
          />
          <Area type="monotone" dataKey="total" name="Total" stroke="#0F766E" strokeWidth={2.5}
            fill="url(#colorTotal)" dot={false} activeDot={{ r: 4, fill: "#0F766E", strokeWidth: 2, stroke: "white" }} />
          <Area type="monotone" dataKey="male" name="Male" stroke="#3B82F6" strokeWidth={2}
            fill="url(#colorMale)" dot={false} activeDot={{ r: 3, fill: "#3B82F6", strokeWidth: 2, stroke: "white" }} />
          <Area type="monotone" dataKey="female" name="Female" stroke="#EC4899" strokeWidth={2}
            fill="url(#colorFemale)" dot={false} activeDot={{ r: 3, fill: "#EC4899", strokeWidth: 2, stroke: "white" }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
