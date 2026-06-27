export const dynamic = 'force-dynamic'

import { ActivityTimeline } from "@/components/activity-logs/activity-timeline";
import { PermissionGate } from "@/components/auth/permission-gate";

export default function ActivityLogsPage() {
  return (
    <PermissionGate permission="viewActivityLogs" description="Only Admins can view activity logs.">
      <ActivityTimeline />
    </PermissionGate>
  );
}
