"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import { BarChart3, AlertCircle, RefreshCw } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const COLORS = [
  "#0F766E", "#0D9488", "#14B8A6", "#2DD4BF", "#5EEAD4",
  "#99F6E4", "#0F766E", "#065F46", "#047857", "#059669",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.count;
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-muted-foreground">Members: <span className="font-bold text-foreground">{total}</span></p>
        <p className="text-muted-foreground">
          Male: <span className="font-bold text-blue-600">{payload[0].payload.male}</span>
          {" / "}
          Female: <span className="font-bold text-pink-600">{payload[0].payload.female}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function AreaDistributionChart() {
  const { data, loading, error, refetch } = useAnalytics();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-[220px] rounded-xl bg-muted/40 animate-pulse" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-3"
      >
        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
        <p className="text-xs text-muted-foreground flex-1">Chart unavailable</p>
        <button onClick={refetch} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </motion.div>
    );
  }

  const areaData = (data?.areas ?? []).slice(0, 10);

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

      {areaData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
          No area data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={areaData} margin={{ top: 5, right: 5, left: -25, bottom: 55 }} barSize={16}>
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
              {areaData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={1 - index * 0.05} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
