export const dynamic = 'force-dynamic'

import { AddMemberForm } from "@/components/add-member/add-member-form";

// FUTURE BACKEND INTEGRATION
// TODO: POST /api/members — MongoDB API Connection
// TODO: JWT Authorization header required
// TODO: Validate on server side, return created member with ID

export default function AddMemberPage() {
  return <AddMemberForm />;
}
