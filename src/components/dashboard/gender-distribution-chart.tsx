"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon, AlertCircle, RefreshCw } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const total = item.payload.total ?? 1;
    const pct = ((item.value / total) * 100).toFixed(1);
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.payload.color }} />
          <span className="font-semibold text-foreground">{item.name}</span>
        </div>
        <p className="text-muted-foreground">Count: <span className="font-semibold text-foreground">{item.value.toLocaleString()}</span></p>
        <p className="text-muted-foreground">Share: <span className="font-semibold text-foreground">{pct}%</span></p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function GenderDistributionChart() {
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
        <div className="h-[180px] rounded-xl bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-16 rounded-xl bg-muted/40 animate-pulse" />
        </div>
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

  const genderData = data?.gender ?? [];
  const total = genderData.reduce((a, b) => a + b.value, 0);
  const enriched = genderData.map((d) => ({ ...d, total }));
  const male = genderData.find((d) => d.name === "Male");
  const female = genderData.find((d) => d.name === "Female");
  const maleRatio = total > 0 ? ((( male?.value ?? 0) / total) * 100).toFixed(1) : "0.0";
  const femaleRatio = total > 0 ? (((female?.value ?? 0) / total) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <PieIcon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground leading-none">Gender Distribution</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Male vs Female breakdown</p>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
          No member data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={enriched}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {enriched.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Male</p>
            <p className="text-sm font-bold text-foreground">{(male?.value ?? 0).toLocaleString()}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">{maleRatio}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/30">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Female</p>
            <p className="text-sm font-bold text-foreground">{(female?.value ?? 0).toLocaleString()}</p>
            <p className="text-[10px] text-pink-600 dark:text-pink-400 font-medium">{femaleRatio}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
