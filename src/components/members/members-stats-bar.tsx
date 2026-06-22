"use client";

import { useDashboardStats } from "@/hooks/useDashboardStats";

export function MembersStatsBar() {
  const { stats, loading } = useDashboardStats();

  const items = [
    { label: "Total Records",  value: loading ? "…" : (stats?.total ?? 0).toLocaleString() },
    { label: "Male",           value: loading ? "…" : (stats?.male ?? 0).toLocaleString() },
    { label: "Female",         value: loading ? "…" : (stats?.female ?? 0).toLocaleString() },
    { label: "Today",          value: loading ? "…" : (stats?.todayCount ?? 0).toLocaleString() },
    { label: "Top Area",       value: loading ? "…" : (stats?.topArea ?? "—") },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg"
        >
          <span className="text-xs text-muted-foreground">{item.label}:</span>
          <span className="text-xs font-bold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
