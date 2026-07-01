export const dynamic = 'force-dynamic'

import { UsersTable } from "@/components/users/users-table";

// Access is restricted to Super Admin inside <UsersTable /> (client component,
// where useAuth()'s role is available); Admin is redirected to an access-denied view.
export default function UsersPage() {
  return <UsersTable />;
}
