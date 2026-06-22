"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { MOCK_AREA_STATS } from "@/lib/mock-data";
import { BarChart3 } from "lucide-react";

const COLORS = [
  "#0F766E", "#0D9488", "#14B8A6", "#2DD4BF", "#5EEAD4",
  "#99F6E4", "#0F766E", "#065F46", "#047857", "#059669",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-muted-foreground">Members: <span className="font-bold text-foreground">{payload[0].value}</span></p>
        <p className="text-muted-foreground">Share: <span className="font-bold text-primary">{payload[0].payload.percentage}%</span></p>
      </div>
    );
  }
  return null;
};

export function AreaDistributionChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground leading-none">Area Distribution</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Top 10 areas by member count</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={MOCK_AREA_STATS}
          margin={{ top: 5, right: 5, left: -25, bottom: 55 }}
          barSize={16}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.6} vertical={false} />
          <XAxis
            dataKey="area"
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            angle={-40}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Members">
            {MOCK_AREA_STATS.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={1 - index * 0.05} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
