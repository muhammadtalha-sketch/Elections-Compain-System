export const dynamic = 'force-dynamic'

import { UsersTable } from "@/components/users/users-table";

// All authenticated users can view this page.
// Management actions (Create / Change Role / Deactivate) are hidden inside the
// table for regular Users — only Admin and Super Admin see those controls.
export default function UsersPage() {
  return <UsersTable />;
}
