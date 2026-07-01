import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Service-role client — bypasses RLS. NEVER import this from client code
// ('use client' files) or expose SUPABASE_SERVICE_ROLE_KEY via NEXT_PUBLIC_*.
// Only use inside Route Handlers to perform trusted admin operations
// (auth.admin.createUser, deleteUser, updateUserById) after the caller's
// Super Admin role has been verified via createSupabaseServerClient().
let _admin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
      throw new Error(
        '[ECS] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
        'Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase Dashboard → Settings → API → service_role key).\n' +
        'Never prefix it with NEXT_PUBLIC_ — it must stay server-only.'
      )
    }

    _admin = createClient<Database>(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _admin
}
