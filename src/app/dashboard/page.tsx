import { StatsCards } from "@/components/dashboard/stats-cards";
import { RegistrationTrendChart } from "@/components/dashboard/registration-trend-chart";
import { GenderDistributionChart } from "@/components/dashboard/gender-distribution-chart";
import { AreaDistributionChart } from "@/components/dashboard/area-distribution-chart";
import { RecentRegistrations } from "@/components/dashboard/recent-registrations";

// FUTURE BACKEND INTEGRATION
// TODO: Fetch dashboard stats from /api/dashboard/stats
// TODO: JWT Authorization header required
// TODO: Server-side Filtering for area/date range

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <RegistrationTrendChart />
        </div>
        <div>
          <GenderDistributionChart />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <AreaDistributionChart />
        </div>
        <div>
          <RecentRegistrations />
        </div>
      </div>
    </div>
  );
}
