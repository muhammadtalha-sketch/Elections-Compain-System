export const dynamic = 'force-dynamic'

import { ImportWizard } from "@/components/import/import-wizard";
import { PermissionGate } from "@/components/auth/permission-gate";

export default function ImportPage() {
  return (
    <PermissionGate permission="importData" description="Only Admins can import data.">
      <ImportWizard />
    </PermissionGate>
  );
}
