export const dynamic = 'force-dynamic'

import { SearchPanel } from "@/components/search/search-panel";

// FUTURE BACKEND INTEGRATION
// TODO: Server-side Filtering via /api/members/search
// TODO: JWT Authorization required
// TODO: Replace frontend filter logic with API query params

export default function SearchPage() {
  return <SearchPanel />;
}
