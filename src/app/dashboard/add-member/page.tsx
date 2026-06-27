export const dynamic = 'force-dynamic'

import { AddMemberForm } from "@/components/add-member/add-member-form";
import { PermissionGate } from "@/components/auth/permission-gate";

export default function AddMemberPage() {
  return (
    <PermissionGate permission="addMembers" description="Only Admins can add members.">
      <AddMemberForm />
    </PermissionGate>
  );
}
