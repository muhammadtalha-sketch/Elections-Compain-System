export const dynamic = 'force-dynamic'

import { SettingsPanel } from "@/components/settings/settings-panel";

// Accessible to all authenticated users — each user manages their own account.
export default function SettingsPage() {
  return <SettingsPanel />;
}
