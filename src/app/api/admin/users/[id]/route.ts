import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireSuperAdmin, isImmutableSuperAdmin } from '@/lib/require-super-admin'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { UserRole } from '@/types/database.types'

const VALID_ROLES: UserRole[] = ['Super Admin', 'Admin']

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status })

  const { id } = await ctx.params
  const body = await request.json().catch(() => null)
  const admin = getSupabaseAdmin()

  const { data: target } = await admin.from('profiles').select('email').eq('id', id).single()
  if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  if (isImmutableSuperAdmin(target.email)) {
    return NextResponse.json({ error: 'The Super Admin account cannot be modified.' }, { status: 403 })
  }
  if (id === gate.user.id) {
    return NextResponse.json({ error: 'You cannot change your own role or status.' }, { status: 400 })
  }

  const update: { role?: UserRole; is_active?: boolean } = {}
  if (body?.role !== undefined) {
    if (!VALID_ROLES.includes(body.role)) {
      return NextResponse.json({ error: 'Role must be Admin or Super Admin.' }, { status: 400 })
    }
    update.role = body.role
  }
  if (body?.is_active !== undefined) {
    update.is_active = Boolean(body.is_active)
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })
  }

  const { error } = await admin.from('profiles').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status })

  const { id } = await ctx.params
  const admin = getSupabaseAdmin()

  const { data: target } = await admin.from('profiles').select('email').eq('id', id).single()
  if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  if (isImmutableSuperAdmin(target.email)) {
    return NextResponse.json({ error: 'The Super Admin account cannot be deleted.' }, { status: 403 })
  }
  if (id === gate.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
