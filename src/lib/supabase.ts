import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>

let _supabase: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error(
        '[ECS] Missing NEXT_PUBLIC_SUPABASE_URL.\n' +
        'Create .env.local with:\n' +
        '  NEXT_PUBLIC_SUPABASE_URL=https://jykopfoifmfdoowbaxoa.supabase.co\n' +
        '  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>\n' +
        'Then restart the dev server. On Vercel, add these in Project Settings → Environment Variables.'
      )
    }

    // Guard against a common mistake: copying the REST or Auth API URL from the
    // Supabase dashboard instead of the plain Project URL.
    // Wrong: https://xxx.supabase.co/rest/v1  → auth calls go to /rest/v1/auth/v1/... (404)
    // Wrong: https://xxx.supabase.co/auth/v1
    // Correct: https://xxx.supabase.co
    if (/\/(rest|auth)\/v\d/i.test(supabaseUrl)) {
      throw new Error(
        '[ECS] NEXT_PUBLIC_SUPABASE_URL contains a path suffix that must be removed.\n' +
        `Current value: ${supabaseUrl}\n` +
        'Required value: https://jykopfoifmfdoowbaxoa.supabase.co\n' +
        'Use the "Project URL" from Supabase Dashboard → Settings → API, not the "API URL (REST)".'
      )
    }

    if (!supabaseKey) {
      throw new Error(
        '[ECS] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
        'Add it to .env.local and restart the dev server.\n' +
        'Find it in the Supabase dashboard → Project Settings → API → Project API keys → anon/public.'
      )
    }

    _supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey)
  }
  return _supabase
}

// Deferred singleton — createBrowserClient() is NOT called at module load time.
// Calling it at module level with undefined env vars crashed all dashboard pages
// on Vercel (SSR evaluated the module before NEXT_PUBLIC_ vars were set).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) { return (getClient() as any)[prop] },
})
