import { MembersTable } from "@/components/members/members-table";
import { MembersStatsBar } from "@/components/members/members-stats-bar";

export default function MembersPage() {
  return (
    <div className="space-y-4">
      <MembersStatsBar />
      <MembersTable />
    </div>
  );
}
