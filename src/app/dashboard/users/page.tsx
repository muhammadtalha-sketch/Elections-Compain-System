import { UsersTable } from "@/components/users/users-table";

// FUTURE BACKEND INTEGRATION
// TODO: GET /api/users — requires Admin JWT role
// TODO: User Authorization — role-based access control
// TODO: POST /api/users to create new user with role assignment

export default function UsersPage() {
  return <UsersTable />;
}
