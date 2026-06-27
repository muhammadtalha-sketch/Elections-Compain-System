import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/profile']
const AUTH_PAGE_PREFIXES  = ['/login', '/signup', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, let the request through — the page-level error
  // boundary (src/app/dashboard/error.tsx) will surface a clear message.
  // Redirecting to /login here would cause an infinite loop when /login itself
  // also fails to load without valid env vars.
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '[ECS Middleware] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
      'Add them to .env.local (dev) or Vercel Environment Variables (production).'
    )
    return NextResponse.next({ request })
  }

  if (/\/(rest|auth)\/v\d/i.test(supabaseUrl)) {
    console.error(
      '[ECS Middleware] NEXT_PUBLIC_SUPABASE_URL has a path suffix — this causes auth to hit /rest/v1/auth/v1/* (404).\n' +
      `Current value: ${supabaseUrl}\n` +
      'Fix: set it to https://jykopfoifmfdoowbaxoa.supabase.co (no path suffix).'
    )
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // getUser() is more secure than getSession() — validates the JWT server-side
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isAuthPage  = AUTH_PAGE_PREFIXES.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.searchParams.delete('next')
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api).*)'],
}
