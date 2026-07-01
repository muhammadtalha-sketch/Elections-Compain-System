import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireSuperAdmin, isImmutableSuperAdmin } from '@/lib/require-super-admin'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireSuperAdmin()
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status })

  const { id } = await ctx.params
  const body = await request.json().catch(() => null)
  const newPassword = body?.password ?? ''

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  const { data: target } = await admin.from('profiles').select('email').eq('id', id).single()
  if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  if (isImmutableSuperAdmin(target.email) && id !== gate.user.id) {
    return NextResponse.json({ error: 'Only the Super Admin can reset their own password.' }, { status: 403 })
  }

  const { error: authErr } = await admin.auth.admin.updateUserById(id, { password: newPassword })
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

  await admin.from('profiles').update({ must_change_password: true }).eq('id', id)

  return NextResponse.json({ ok: true })
}
