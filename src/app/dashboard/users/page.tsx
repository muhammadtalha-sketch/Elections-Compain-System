export const dynamic = 'force-dynamic'

import { UsersTable } from "@/components/users/users-table";
import { PermissionGate } from "@/components/auth/permission-gate";

export default function UsersPage() {
  return (
    <PermissionGate permission="viewUsers" description="Only Admins can manage system users.">
      <UsersTable />
    </PermissionGate>
  );
}
