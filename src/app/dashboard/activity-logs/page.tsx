export const dynamic = 'force-dynamic'

import { ActivityTimeline } from "@/components/activity-logs/activity-timeline";

// FUTURE BACKEND INTEGRATION
// TODO: GET /api/logs — paginated activity logs from MongoDB
// TODO: JWT Authorization required
// TODO: Real-time updates via WebSocket or Server-Sent Events

export default function ActivityLogsPage() {
  return <ActivityTimeline />;
}
