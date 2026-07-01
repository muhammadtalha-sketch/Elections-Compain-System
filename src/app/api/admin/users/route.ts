import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireSuperAdmin } from '@/lib/require-super-admin'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { UserRole } from '@/types/database.types'

const VALID_ROLES: UserRole[] = ['Super Admin', 'Admin']

export async function POST(request: NextRequest) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status })

  const body = await request.json().catch(() => null)
  const fullName = (body?.fullName ?? '').trim()
  const email    = (body?.email ?? '').trim().toLowerCase()
  const password = body?.password ?? ''
  const role     = body?.role as UserRole

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: 'Full name, email, and password are required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Role must be Admin or Super Admin.' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  })

  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? 'Failed to create user.' }, { status: 400 })
  }

  // Belt-and-suspenders: explicitly set the intended role/state, independent
  // of whatever the handle_new_user trigger inserted.
  const { error: profileErr } = await admin
    .from('profiles')
    .update({ full_name: fullName, role, is_active: true, must_change_password: true })
    .eq('id', created.user.id)

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 400 })
  }

  return NextResponse.json({ id: created.user.id })
}
