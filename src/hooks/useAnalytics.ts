"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMonthlyTrend,
  getAreaDistribution,
  getGenderDistribution,
  getWeeklyTrend,
  getBirthYearDistribution,
  getInterestStatusDistribution,
  MonthlyDataPoint,
  AreaDataPoint,
  BirthYearDataPoint,
  InterestDistribution,
} from "@/services/analyticsService";

interface AnalyticsData {
  monthly:   MonthlyDataPoint[];
  areas:     AreaDataPoint[];
  gender:    { name: string; value: number; color: string }[];
  weekly:    { day: string; male: number; female: number; total: number }[];
  birthYear: BirthYearDataPoint[];
  interest:  InterestDistribution;
}

interface UseAnalyticsReturn {
  data:    AnalyticsData | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [monthly, areas, gender, weekly, birthYear, interest] = await Promise.all([
        getMonthlyTrend(12),
        getAreaDistribution(),
        getGenderDistribution(),
        getWeeklyTrend(),
        getBirthYearDistribution(),
        getInterestStatusDistribution(),
      ]);
      setData({ monthly, areas, gender, weekly, birthYear, interest });
    } catch (err: unknown) {
      setError((err as Error).message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
