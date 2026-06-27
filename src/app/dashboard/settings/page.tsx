export const dynamic = 'force-dynamic'

import { SettingsPanel } from "@/components/settings/settings-panel";
import { PermissionGate } from "@/components/auth/permission-gate";

export default function SettingsPage() {
  return (
    <PermissionGate permission="manageSettings" description="Only Super Admins can access system settings.">
      <SettingsPanel />
    </PermissionGate>
  );
}
