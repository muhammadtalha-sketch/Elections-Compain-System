export const dynamic = 'force-dynamic'

import { MemberDetail } from "@/components/members/member-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  return <MemberDetail memberId={id} />;
}
