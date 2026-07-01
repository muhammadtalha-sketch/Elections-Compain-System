import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { SUPER_ADMIN_EMAIL } from '@/lib/rbac'

// Server-side gate for all /api/admin/users/* routes. UI-level hiding is not
// enough — every mutating admin endpoint must re-check the caller's role
// against the DB, otherwise a direct API call could bypass a hidden button.
export async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, status: 401, message: 'Not authenticated.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'Super Admin' || !profile.is_active) {
    return { ok: false as const, status: 403, message: 'Only Super Admin can perform this action.' }
  }

  return { ok: true as const, user }
}

export function isImmutableSuperAdmin(email: string | null | undefined): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
}
