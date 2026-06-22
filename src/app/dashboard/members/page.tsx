import { MembersTable } from "@/components/members/members-table";
import { MOCK_MEMBERS } from "@/lib/mock-data";

// FUTURE BACKEND INTEGRATION
// TODO: Fetch paginated members from /api/members?page=1&limit=25
// TODO: JWT Authorization header required
// TODO: Server-side Filtering, sorting, and search

export default function MembersPage() {
  const stats = [
    { label: "Total Records", value: MOCK_MEMBERS.length },
    { label: "Active", value: MOCK_MEMBERS.filter((m) => m.status === "Active").length },
    { label: "Pending", value: MOCK_MEMBERS.filter((m) => m.status === "Pending").length },
    { label: "Male", value: MOCK_MEMBERS.filter((m) => m.gender === "Male").length },
    { label: "Female", value: MOCK_MEMBERS.filter((m) => m.gender === "Female").length },
  ];

  return (
    <div className="space-y-4">
      {/* Quick stats row */}
      <div className="flex flex-wrap gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg"
          >
            <span className="text-xs text-muted-foreground">{stat.label}:</span>
            <span className="text-xs font-bold text-foreground">{stat.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <MembersTable />
    </div>
  );
}
