"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MOCK_GENDER_DATA, DASHBOARD_STATS } from "@/lib/mock-data";
import { PieChart as PieIcon } from "lucide-react";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const pct = ((item.value / DASHBOARD_STATS.totalMembers) * 100).toFixed(1);
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
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function GenderDistributionChart() {
  const maleRatio = ((DASHBOARD_STATS.maleMembers / DASHBOARD_STATS.totalMembers) * 100).toFixed(1);
  const femaleRatio = ((DASHBOARD_STATS.femaleMembers / DASHBOARD_STATS.totalMembers) * 100).toFixed(1);

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

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={MOCK_GENDER_DATA}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {MOCK_GENDER_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30">
          <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Male</p>
            <p className="text-sm font-bold text-foreground">{DASHBOARD_STATS.maleMembers.toLocaleString()}</p>
            <p className="text-[10px] text-primary font-medium">{maleRatio}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Female</p>
            <p className="text-sm font-bold text-foreground">{DASHBOARD_STATS.femaleMembers.toLocaleString()}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{femaleRatio}%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
