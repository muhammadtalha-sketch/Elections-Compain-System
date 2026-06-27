"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Users, MapPin, Activity, BarChart3,
  PieChart as PieIcon, AlertCircle, RefreshCw, Calendar,
  ThumbsUp, ThumbsDown, Clock,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDashboardStats } from "@/hooks/useDashboardStats";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return <div className={`rounded-xl bg-muted/40 animate-pulse`} style={{ height }} />;
}

function ChartError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="h-[180px] flex flex-col items-center justify-center gap-2">
      <AlertCircle className="w-5 h-5 text-destructive" />
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">{message}</p>
      <button onClick={onRetry} className="text-xs text-primary flex items-center gap-1 hover:underline">
        <RefreshCw className="w-3 h-3" /> Retry
      </button>
    </div>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
      {label}
    </div>
  );
}

const STAT_COLORS: Record<string, string> = {
  teal:    "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
  violet:  "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  amber:   "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
};

export function AnalyticsDashboard() {
  const { data, loading: analyticsLoading, error: analyticsError, refetch } = useAnalytics();
  const { stats, loading: statsLoading } = useDashboardStats();

  const topStats = [
    {
      label: "Total Members",
      value: statsLoading ? "…" : (stats?.total.toLocaleString() ?? "0"),
      icon: Users,
      color: "teal",
      trend: "All time",
    },
    {
      label: "Active Areas",
      value: analyticsLoading ? "…" : String(data?.areas.filter((a) => a.count > 0).length ?? 0),
      icon: MapPin,
      color: "violet",
      trend: "Sialkot district",
    },
    {
      label: "This Month",
      value: statsLoading ? "…" : (stats?.thisMonthCount.toLocaleString() ?? "0"),
      icon: Activity,
      color: "amber",
      trend: new Date().toLocaleString("en-PK", { month: "long", year: "numeric" }),
    },
    {
      label: "Top Area",
      value: analyticsLoading ? "…" : (data?.areas[0]?.area ?? "—"),
      icon: TrendingUp,
      color: "emerald",
      trend: data?.areas[0] ? `${data.areas[0].count.toLocaleString()} members` : "—",
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── Top stat cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl p-4 shadow-sm"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${STAT_COLORS[stat.color]}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-primary font-medium mt-1">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Campaign Support Status ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/20">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Campaign Support Status</h3>
            <p className="text-[10px] text-muted-foreground">Voter engagement overview</p>
          </div>
        </div>
        <div className="p-5">
          {analyticsLoading ? (
            <ChartSkeleton height={140} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Interested",
                    value: data?.interest.interested ?? 0,
                    icon: ThumbsUp,
                    color: "text-green-600 dark:text-green-400",
                    bg:    "bg-green-50 dark:bg-green-950/40",
                    fill:  "#16a34a",
                  },
                  {
                    label: "Not Interested",
                    value: data?.interest.notInterested ?? 0,
                    icon: ThumbsDown,
                    color: "text-red-600 dark:text-red-400",
                    bg:    "bg-red-50 dark:bg-red-950/40",
                    fill:  "#dc2626",
                  },
                  {
                    label: "Pending",
                    value: data?.interest.pending ?? 0,
                    icon: Clock,
                    color: "text-amber-600 dark:text-amber-400",
                    bg:    "bg-amber-50 dark:bg-amber-950/40",
                    fill:  "#d97706",
                  },
                ].map((item) => {
                  const pct = data?.interest.total
                    ? Math.round((item.value / data.interest.total) * 100)
                    : 0;
                  return (
                    <div key={item.label} className={`rounded-xl p-3 ${item.bg}`}>
                      <item.icon className={`w-4 h-4 mb-2 ${item.color}`} />
                      <p className="text-xl font-bold text-foreground">{item.value.toLocaleString()}</p>
                      <p className={`text-[10px] font-semibold ${item.color}`}>{item.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{pct}%</p>
                    </div>
                  );
                })}
              </div>

              {/* Pie chart */}
              {(data?.interest.total ?? 0) > 0 ? (
                <div>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Interested",     value: data?.interest.interested    ?? 0, color: "#16a34a" },
                          { name: "Not Interested", value: data?.interest.notInterested ?? 0, color: "#dc2626" },
                          { name: "Pending",        value: data?.interest.pending       ?? 0, color: "#d97706" },
                        ].filter((d) => d.value > 0)}
                        cx="50%" cy="50%"
                        outerRadius={60} innerRadius={30}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          { color: "#16a34a" },
                          { color: "#dc2626" },
                          { color: "#d97706" },
                        ].map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-1">
                    {[
                      { label: "Interested",     color: "#16a34a", value: data?.interest.interested    ?? 0 },
                      { label: "Not Interested", color: "#dc2626", value: data?.interest.notInterested ?? 0 },
                      { label: "Pending",        color: "#d97706", value: data?.interest.pending       ?? 0 },
                    ].map((g) => (
                      <div key={g.label} className="flex items-center gap-1.5 text-[11px]">
                        <div className="w-2 h-2 rounded-full" style={{ background: g.color }} />
                        <span className="text-muted-foreground">{g.label}</span>
                        <span className="font-semibold text-foreground">{g.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ChartEmpty label="No interest data yet — mark members as Interested / Not Interested" />
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Row 1: Monthly trend + Gender ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Monthly registration trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Monthly Registration Trend</h3>
              <p className="text-[10px] text-muted-foreground">Last 12 months by registration date</p>
            </div>
          </div>
          {analyticsLoading ? (
            <ChartSkeleton height={220} />
          ) : analyticsError ? (
            <ChartError message={analyticsError} onRetry={refetch} />
          ) : (data?.monthly ?? []).every((d) => d.total === 0) ? (
            <ChartEmpty label="No registration data in this period" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.monthly ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="total"  name="Total"  stroke="#0F766E" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="male"   name="Male"   stroke="#3B82F6" strokeWidth={2}   dot={false} activeDot={{ r: 3 }} />
                <Line type="monotone" dataKey="female" name="Female" stroke="#EC4899" strokeWidth={2}   dot={false} activeDot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Gender split */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <PieIcon className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Gender Split</h3>
              <p className="text-[10px] text-muted-foreground">All members</p>
            </div>
          </div>
          {analyticsLoading ? (
            <ChartSkeleton height={200} />
          ) : analyticsError ? (
            <ChartError message={analyticsError} onRetry={refetch} />
          ) : (data?.gender.reduce((a, b) => a + b.value, 0) ?? 0) === 0 ? (
            <ChartEmpty label="No member data" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={data?.gender ?? []}
                    cx="50%" cy="50%"
                    outerRadius={68} innerRadius={36}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(data?.gender ?? []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                {(data?.gender ?? []).map((g) => (
                  <div key={g.name} className="flex items-center gap-1.5 text-[11px]">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: g.color }} />
                    <span className="text-muted-foreground">{g.name}</span>
                    <span className="font-semibold text-foreground">{g.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Row 2: Area distribution ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Area Distribution</h3>
            <p className="text-[10px] text-muted-foreground">Top 10 areas by member count</p>
          </div>
        </div>
        {analyticsLoading ? (
          <ChartSkeleton height={220} />
        ) : analyticsError ? (
          <ChartError message={analyticsError} onRetry={refetch} />
        ) : (data?.areas ?? []).length === 0 ? (
          <ChartEmpty label="No area data available" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={(data?.areas ?? []).slice(0, 10)}
              margin={{ top: 5, right: 10, left: -10, bottom: 50 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="area"
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false}
                angle={-35} textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={45} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar dataKey="male"   name="Male"   fill="#3B82F6" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="female" name="Female" fill="#EC4899" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── Area statistics summary ───────────────────────────── */}
      {!analyticsLoading && !analyticsError && (data?.areas ?? []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            {
              label: "Total Areas",
              value: data!.areas.length,
              sub: "distinct locations",
            },
            {
              label: "Largest Area",
              value: data!.areas[0]?.area ?? "—",
              sub: `${(data!.areas[0]?.count ?? 0).toLocaleString()} members`,
            },
            {
              label: "2nd Largest",
              value: data!.areas[1]?.area ?? "—",
              sub: `${(data!.areas[1]?.count ?? 0).toLocaleString()} members`,
            },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-bold text-foreground mt-1 truncate">{item.value}</p>
              <p className="text-[10px] text-primary mt-0.5">{item.sub}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Row 3: Birth year + Weekly ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Birth year distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Age Distribution</h3>
              <p className="text-[10px] text-muted-foreground">Members by birth decade</p>
            </div>
          </div>
          {analyticsLoading ? (
            <ChartSkeleton height={200} />
          ) : analyticsError ? (
            <ChartError message={analyticsError} onRetry={refetch} />
          ) : (data?.birthYear ?? []).length === 0 ? (
            <ChartEmpty label="No birth year data available" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data?.birthYear ?? []}
                margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                barSize={28}
              >
                <defs>
                  <linearGradient id="birthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#F59E0B" stopOpacity={1} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                <Bar dataKey="count" name="Members" fill="url(#birthGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Weekly registration pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Weekly Pattern</h3>
              <p className="text-[10px] text-muted-foreground">Registrations in the last 7 days</p>
            </div>
          </div>
          {analyticsLoading ? (
            <ChartSkeleton height={200} />
          ) : analyticsError ? (
            <ChartError message={analyticsError} onRetry={refetch} />
          ) : (data?.weekly.every((d) => d.male === 0 && d.female === 0)) ? (
            <ChartEmpty label="No registrations in the past 7 days" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data?.weekly ?? []}
                margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="male"   name="Male"   fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="female" name="Female" fill="#EC4899" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
