"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { MOCK_MONTHLY_REGISTRATIONS } from "@/lib/mock-data";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
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

export function RegistrationTrendChart() {
  const total = MOCK_MONTHLY_REGISTRATIONS.reduce((a, b) => a + b.registrations, 0);

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
          <p className="text-[10px] text-muted-foreground">Total 2024</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={MOCK_MONTHLY_REGISTRATIONS} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
            formatter={(value) => <span style={{ color: "var(--muted-foreground)", textTransform: "capitalize" }}>{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="registrations"
            name="Total"
            stroke="#0F766E"
            strokeWidth={2.5}
            fill="url(#colorTotal)"
            dot={false}
            activeDot={{ r: 4, fill: "#0F766E", strokeWidth: 2, stroke: "white" }}
          />
          <Area
            type="monotone"
            dataKey="male"
            name="Male"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#colorMale)"
            dot={false}
            activeDot={{ r: 3, fill: "#3B82F6", strokeWidth: 2, stroke: "white" }}
          />
          <Area
            type="monotone"
            dataKey="female"
            name="Female"
            stroke="#EC4899"
            strokeWidth={2}
            fill="url(#colorFemale)"
            dot={false}
            activeDot={{ r: 3, fill: "#EC4899", strokeWidth: 2, stroke: "white" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
